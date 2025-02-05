import { redirect } from 'next/navigation'

import AuthErrorPage from 'app/autherror/AuthErrorPage'
import { StructureConseiller } from 'interfaces/conseiller'

type AuthErrorSearchParams = Promise<
  Partial<{
    reason: string
    typeUtilisateur: string
    structureUtilisateur: string
  }>
>

export default async function AuthError({
  searchParams,
}: {
  searchParams?: AuthErrorSearchParams
}) {
  const { reason, typeUtilisateur, structureUtilisateur } =
    (await searchParams) ?? {}

  if (typeUtilisateur === 'CONSEILLER') {
    return (
      <AuthErrorPage
        erreur={erreurConseiller(reason, structureUtilisateur)}
        codeErreur={reason}
        lienFormulaire={lienFormulaireConseiller(structureUtilisateur)}
      />
    )
  }

  return (
    <AuthErrorPage
      erreur={erreurBeneficiaire(reason, structureUtilisateur)}
      codeErreur={reason}
    />
  )
}

function erreurBeneficiaire(
  reason?: string,
  structureUtilisateur?: string
): string {
  {
    switch (reason) {
      case 'UTILISATEUR_INEXISTANT':
        return "Votre compte n'est pas enregistré sur l'application, veuillez contacter votre conseiller."
      case 'UTILISATEUR_DEJA_MILO':
        return "Veuillez vous connecter en choisissant Mission Locale sur l'application du CEJ ou contacter votre conseiller pour recréer le compte."
      case 'UTILISATEUR_DEJA_PE':
        return "Veuillez vous connecter en choisissant France Travail sur l'application CEJ ou contacter votre conseiller pour recréer le compte."
      case 'UTILISATEUR_DEJA_PE_BRSA':
      case 'UTILISATEUR_DEJA_PE_AIJ':
      case 'UTILISATEUR_DEJA_CONSEIL_DEPT':
      case 'UTILISATEUR_DEJA_AVENIR_PRO':
        return "Veuillez vous connecter en choisissant France Travail sur l'application Pass Emploi ou contacter votre conseiller pour recréer le compte."
      case 'Callback':
        return erreurIdp(structureUtilisateur)
      default: {
        return `Une erreur est survenue, veuillez fermer cette page et retenter de vous connecter.\n\nSi le problème persiste, veuillez supprimer le cache de votre navigateur ou contacter votre conseiller.`
      }
    }
  }
}

function erreurConseiller(
  reason?: string,
  structureUtilisateur?: string
): string {
  switch (reason) {
    case 'UTILISATEUR_INEXISTANT':
      redirect('/login/france-travail/dispositifs')
      break
    case 'UTILISATEUR_DEJA_MILO':
      return "Veuillez vous connecter en choisissant l'accompagnement Mission Locale. Si vous avez changé d'accompagnement, veuillez supprimer votre compte ou contacter le support."
    case 'UTILISATEUR_DEJA_PE':
      return "Veuillez vous connecter en choisissant l'accompagnement France Travail Contrat d'engagement jeune. Si vous avez changé d'accompagnement, veuillez supprimer votre compte ou contacter le support."
    case 'UTILISATEUR_DEJA_PE_BRSA':
      return "Veuillez vous connecter en choisissant l'accompagnement France Travail RSA rénové. Si vous avez changé d'accompagnement, veuillez supprimer votre compte ou contacter le support."
    case 'UTILISATEUR_DEJA_PE_AIJ':
      return "Veuillez vous connecter en choisissant l'accompagnement France Travail Accompagnement intensif jeunes. Si vous avez changé d'accompagnement, veuillez supprimer votre compte ou contacter le support."
    case 'UTILISATEUR_DEJA_AVENIR_PRO':
      return "Veuillez vous connecter en choisissant l'accompagnement France Travail Avenir pro. Si vous avez changé d'accompagnement, veuillez supprimer votre compte ou contacter le support."
    case 'Callback':
      return erreurIdp(structureUtilisateur)
    case 'VerificationConseillerDepartemental':
      return `Vous n'êtes pas autorisé à vous connecter. Veuiller contacter le support.`
    default:
      return `Une erreur est survenue, veuillez fermer cette page et retenter de vous connecter.\n\nSi le problème persiste, veuillez supprimer le cache de votre navigateur.`
  }
}

function lienFormulaireConseiller(structureUtilisateur?: string) {
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
        (process.env.NEXT_PUBLIC_FAQ_PASS_EMPLOI_EXTERNAL_LINK as string) +
        'assistance/'
      )
  }
}

function erreurIdp(structureUtilisateur?: string) {
  const idpName = (() => {
    switch (structureUtilisateur) {
      case 'MILO':
        return 'i-Milo'
      case 'POLE_EMPLOI':
      case 'POLE_EMPLOI_BRSA':
      case 'POLE_EMPLOI_AIJ':
      case 'FRANCE_TRAVAIL':
      case 'AVENIR_PRO':
        return 'France Travail Connect'
      case 'CONSEIL_DEPT':
      default:
        return 'du fournisseur d’identité'
    }
  })()
  return `Une erreur ${idpName} est survenue, veuillez réessayer ultérieurement.`
}
