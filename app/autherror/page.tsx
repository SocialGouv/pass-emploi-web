import AuthErrorPage from 'app/autherror/AuthErrorPage'
import { StructureConseiller } from 'interfaces/conseiller'

type AuthErrorSearchParams = Promise<
  Partial<{
    reason?: string
    typeUtilisateur?: string
    structureUtilisateur?: string
  }>
>
export default async function AuthError({
  searchParams,
}: {
  searchParams?: AuthErrorSearchParams
}) {
  let erreur: string
  let codeErreur: string | undefined
  let lienFormulaire: string | undefined
  const { reason, typeUtilisateur, structureUtilisateur } =
    (await searchParams) ?? {}

  switch (reason) {
    case 'UTILISATEUR_INEXISTANT':
      erreur =
        "Votre compte n'est pas enregistré sur l'application, veuillez contacter votre conseiller."
      break
    case 'UTILISATEUR_DEJA_MILO':
      erreur =
        "Veuillez vous connecter en choisissant Mission Locale sur l'application du CEJ ou contacter votre conseiller pour recréer le compte."
      break
    case 'UTILISATEUR_DEJA_PE':
      erreur =
        "Veuillez vous connecter en choisissant France Travail sur l'application CEJ ou contacter votre conseiller pour recréer le compte."
      break
    case 'UTILISATEUR_DEJA_PE_BRSA':
    case 'UTILISATEUR_DEJA_PE_AIJ':
    case 'UTILISATEUR_DEJA_CONSEIL_DEPT':
    case 'UTILISATEUR_DEJA_AVENIR_PRO':
      erreur =
        "Veuillez vous connecter en choisissant France Travail sur l'application Pass Emploi ou contacter votre conseiller pour recréer le compte."
      break
    case 'UTILISATEUR_CONSEILLER_MAUVAISE_STRUCTURE':
      erreur =
        "Veuillez vous connecter en choisissant le bon accompagnement (CEJ / BRSA / AIJ). Si vous avez changé d'accompagnement, veuillez supprimer votre compte ou contacter le support."
      break
    default:
      {
        const ouContacterConseiller =
          typeUtilisateur === 'JEUNE' || typeUtilisateur === 'BENEFICIAIRE'
            ? ' ou contacter votre conseiller'
            : ''

        if (reason === 'Callback') {
          let idpName = ''
          switch (structureUtilisateur) {
            case 'MILO':
              idpName = 'i-Milo'
              break
            case 'POLE_EMPLOI':
            case 'POLE_EMPLOI_BRSA':
            case 'POLE_EMPLOI_AIJ':
            case 'FRANCE_TRAVAIL':
            case 'CONSEIL_DEPT':
            case 'AVENIR_PRO':
              idpName = 'France Travail Connect'
              break
            default:
              idpName = "du fournisseur d'identité"
          }
          erreur = `Une erreur ${idpName} est survenue, veuillez réessayer ultérieurement${ouContacterConseiller}.`
        } else if (reason === 'VerificationConseillerDepartemental') {
          erreur = `Vous n'êtes pas autorisé à vous connecter. Veuiller contacter le support.`
        } else {
          erreur = `Une erreur est survenue, veuillez fermer cette page et retenter de vous connecter.\n\nSi le problème persiste, veuillez supprimer le cache de votre navigateur${ouContacterConseiller}.`
          codeErreur = reason
        }
      }
      if (typeUtilisateur === 'CONSEILLER') {
        lienFormulaire = ((): string | undefined => {
          switch (structureUtilisateur) {
            case StructureConseiller.MILO:
              return (
                (process.env.NEXT_PUBLIC_FAQ_MILO_EXTERNAL_LINK as string) +
                'assistance/'
              )
            case StructureConseiller.POLE_EMPLOI:
              return (
                (process.env.NEXT_PUBLIC_FAQ_PE_EXTERNAL_LINK as string) +
                'formuler-une-demande/'
              )
            case StructureConseiller.POLE_EMPLOI_BRSA:
            case StructureConseiller.POLE_EMPLOI_AIJ:
            case StructureConseiller.CONSEIL_DEPT:
            case StructureConseiller.AVENIR_PRO:
              return (
                (process.env
                  .NEXT_PUBLIC_FAQ_PASS_EMPLOI_EXTERNAL_LINK as string) +
                'assistance/'
              )
          }
        })()
      }
  }

  return (
    <AuthErrorPage
      erreur={erreur}
      codeErreur={codeErreur}
      lienFormulaire={lienFormulaire}
    />
  )
}
