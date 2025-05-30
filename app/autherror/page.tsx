import { redirect } from 'next/navigation'

import AuthErrorPage from 'app/autherror/AuthErrorPage'
import {
  estStructure,
  getUrlFormulaireSupport,
  Structure,
} from 'interfaces/structure'

type AuthErrorSearchParams = Promise<
  Partial<{
    reason: string
    typeUtilisateur: string
    structureUtilisateur: string
    email?: string
  }>
>

export default async function AuthError({
  searchParams,
}: {
  searchParams?: AuthErrorSearchParams
}) {
  const { reason, typeUtilisateur, structureUtilisateur, email } =
    (await searchParams) ?? {}

  if (typeUtilisateur === 'CONSEILLER') {
    const { erreur, withTuto } = erreurConseiller(reason, structureUtilisateur)

    return (
      <AuthErrorPage
        erreur={erreur}
        codeErreur={reason}
        withStructure={
          structureUtilisateur
            ? {
                structure: structureUtilisateur as Structure,
                lienFormulaire: lienFormulaireConseiller(structureUtilisateur),
                withTuto,
              }
            : undefined
        }
      />
    )
  }

  return (
    <AuthErrorPage
      erreur={erreurBeneficiaire(reason, structureUtilisateur, email)}
      codeErreur={reason}
    />
  )
}

function erreurBeneficiaire(
  reason?: string,
  structureUtilisateur?: string,
  email?: string
): string {
  {
    switch (reason) {
      case 'UTILISATEUR_INEXISTANT':
        return `Votre compte n'est pas enregistré sur l'application, veuillez contacter votre conseiller.${email && structureUtilisateur !== 'MILO' ? `\n(votre adresse e-mail associée : ${email})` : ''}`
      case 'UTILISATEUR_DEJA_MILO':
        return "Veuillez vous connecter en choisissant Mission Locale sur l'application du CEJ ou contacter votre conseiller pour recréer le compte."
      case 'UTILISATEUR_DEJA_PE':
        return "Veuillez vous connecter en choisissant France Travail sur l'application CEJ ou contacter votre conseiller pour recréer le compte."
      case 'UTILISATEUR_DEJA_PE_BRSA':
      case 'UTILISATEUR_DEJA_PE_AIJ':
      case 'UTILISATEUR_DEJA_CONSEIL_DEPT':
      case 'UTILISATEUR_DEJA_AVENIR_PRO':
      case 'UTILISATEUR_DEJA_ACCOMPAGNEMENT_INTENSIF':
      case 'UTILISATEUR_DEJA_ACCOMPAGNEMENT_GLOBAL':
      case 'UTILISATEUR_DEJA_EQUIP_EMPLOI_RECRUT':
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
): { erreur: string; withTuto?: boolean } {
  switch (reason) {
    case 'UTILISATEUR_INEXISTANT':
      redirect('/login/france-travail/dispositifs')
      break
    case 'UTILISATEUR_DEJA_MILO':
      return {
        erreur:
          "Votre compte est déjà associé à l'accompagnement Mission Locale.\nPour vous connecter avec un autre dispositif, connectez vous au compte lié à l'accompagnement Mission Locale pour le supprimer ou contactez le support.",
        withTuto: true,
      }
    case 'UTILISATEUR_DEJA_PE':
      return {
        erreur:
          "Votre compte est déjà associé à l'accompagnement France Travail Contrat d'engagement jeune.\nPour vous connecter avec un autre dispositif, connectez vous au compte lié à l'accompagnement France Travail Contrat d'engagement jeune pour le supprimer ou contactez le support.",
        withTuto: true,
      }
    case 'UTILISATEUR_DEJA_PE_BRSA':
      return {
        erreur:
          "Votre compte est déjà associé à l'accompagnement France Travail RSA rénové.\nPour vous connecter avec un autre dispositif, connectez vous au compte lié à l'accompagnement France Travail RSA rénové pour le supprimer ou contactez le support.",
        withTuto: true,
      }
    case 'UTILISATEUR_DEJA_PE_AIJ':
      return {
        erreur:
          "Votre compte est déjà associé à l'accompagnement France Travail Accompagnement intensif jeunes.\nPour vous connecter avec un autre dispositif, connectez vous au compte lié à l'accompagnement France Travail Accompagnement intensif jeunes pour le supprimer ou contactez le support.",
        withTuto: true,
      }
    case 'UTILISATEUR_DEJA_AVENIR_PRO':
      return {
        erreur:
          "Votre compte est déjà associé à l'accompagnement France Travail Avenir pro.\nPour vous connecter avec un autre dispositif, connectez vous au compte lié à l'accompagnement France Travail Avenir pro pour le supprimer ou contactez le support.",
        withTuto: true,
      }
    case 'UTILISATEUR_DEJA_ACCOMPAGNEMENT_INTENSIF':
      return {
        erreur:
          "Votre compte est déjà associé à l'accompagnement France Travail REN-Intensif / FTT-FTX.\nPour vous connecter avec un autre dispositif, connectez vous au compte lié à l'accompagnement France Travail REN-Intensif pour le supprimer ou contactez le support.",
        withTuto: true,
      }
    case 'UTILISATEUR_DEJA_ACCOMPAGNEMENT_GLOBAL':
      return {
        erreur:
          "Votre compte est déjà associé à l'accompagnement France Travail Accompagnement global.\nPour vous connecter avec un autre dispositif, connectez vous au compte lié à l'accompagnement France Travail Accompagnement global pour le supprimer ou contactez le support.",
        withTuto: true,
      }
    case 'UTILISATEUR_DEJA_EQUIP_EMPLOI_RECRUT':
      return {
        erreur:
          "Votre compte est déjà associé à l'accompagnement France Travail Equip’Emploi / Equip’recrut.\nPour vous connecter avec un autre dispositif, connectez vous au compte lié à l'accompagnement France Travail Equip’Emploi / Equip’recrut pour le supprimer ou contactez le support.",
        withTuto: true,
      }
    case 'Callback':
      return { erreur: erreurIdp(structureUtilisateur) }
    case 'VerificationConseillerDepartemental':
      return {
        erreur: `Vous n'êtes pas autorisé à vous connecter. Veuiller contacter le support.`,
      }
    default:
      return {
        erreur: `Une erreur est survenue, veuillez fermer cette page et retenter de vous connecter.\n\nSi le problème persiste, veuillez supprimer le cache de votre navigateur.`,
      }
  }
}

function lienFormulaireConseiller(
  structureUtilisateur: string
): string | undefined {
  if (!structureUtilisateur || !estStructure(structureUtilisateur)) return
  return getUrlFormulaireSupport(structureUtilisateur)
}

function erreurIdp(structureUtilisateur?: string) {
  const idpName = (() => {
    switch (structureUtilisateur) {
      case 'MILO':
        return 'i-Milo'
      case 'POLE_EMPLOI':
      case 'POLE_EMPLOI_BRSA':
      case 'POLE_EMPLOI_AIJ':
      case 'AVENIR_PRO':
      case 'FT_ACCOMPAGNEMENT_INTENSIF':
      case 'FT_ACCOMPAGNEMENT_GLOBAL':
      case 'FT_EQUIP_EMPLOI_RECRUT':
      case 'FRANCE_TRAVAIL':
        return 'France Travail Connect'
      case 'CONSEIL_DEPT':
      default:
        return 'du fournisseur d’identité'
    }
  })()
  return `Une erreur ${idpName} est survenue, veuillez réessayer ultérieurement.`
}
