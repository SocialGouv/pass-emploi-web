import { StructureConseiller } from '../../interfaces/conseiller'

import AuthErrorPage from 'app/autherror/AuthErrorPage'

type AuthErrorSearchParams = Partial<{
  reason?: string
  typeUtilisateur: string
  structureUtilisateur: string
}>

export default function AuthError({
  searchParams,
}: {
  searchParams?: AuthErrorSearchParams
}) {
  let erreur: string
  let lienFormulaire: string | undefined
  switch (searchParams?.reason) {
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
      erreur =
        "Veuillez vous connecter en choisissant France Travail sur l'application Pass Emploi ou contacter votre conseiller pour recréer le compte."
      break
    case 'UTILISATEUR_CONSEILLER_MAUVAISE_STRUCTURE':
      erreur =
        "Veuillez vous connecter en choisissant le bon accompagnement (CEJ / BRSA / AIJ). Si vous avez changé d'accompagnement, veuillez supprimer votre compte ou contacter le support."
      break
    default: {
      erreur =
        'Une erreur inconnue est survenue, veuillez essayer les solutions suivantes :\n\n- Recharger cette page\n- Activer les cookies\n- Supprimer le cache navigateur'

      if (searchParams?.typeUtilisateur === 'JEUNE') {
        erreur +=
          '\n\nVeuillez contacter votre conseiller si le problème persiste.'
      } else if (searchParams?.typeUtilisateur === 'CONSEILLER') {
        lienFormulaire = ((): string | undefined => {
          switch (searchParams.structureUtilisateur) {
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
              return (
                (process.env
                  .NEXT_PUBLIC_FAQ_PASS_EMPLOI_EXTERNAL_LINK as string) +
                'assistance/'
              )
          }
        })()
      }
    }
  }

  return (
    <AuthErrorPage
      erreur={erreur}
      codeErreur={searchParams?.reason}
      lienFormulaire={lienFormulaire}
    />
  )
}
