import AuthErrorPage from 'app/autherror/AuthErrorPage'
import { StructureConseiller } from 'interfaces/conseiller'

type AuthErrorSearchParams = Partial<{
  reason: string
  typeUtilisateur: 'JEUNE' | 'CONSEILLER'
  structureUtilisateur: StructureConseiller
}>

export default function AuthError({
  searchParams,
}: {
  searchParams?: AuthErrorSearchParams
}) {
  let erreur: string
  switch (searchParams?.reason) {
    case 'UTILISATEUR_INEXISTANT':
      erreur =
        "Votre compte n'est pas enregistré sur l'application, veuillez contacter votre conseiller"
      break
    case 'UTILISATEUR_DEJA_MILO':
      erreur =
        'Veuillez vous connecter en choisissant Mission Locale ou contacter votre conseiller pour recréer le compte'
      break
    case 'UTILISATEUR_NOUVEAU_MILO':
      erreur =
        'Veuillez vous connecter en choisissant Mission Locale ou contacter votre conseiller pour recréer le compte'
      break
    case 'UTILISATEUR_DEJA_PE':
      erreur =
        "Veuillez vous connecter en choisissant France Travail sur l'application CEJ ou contacter votre conseiller pour recréer le compte"
      break
    case 'UTILISATEUR_NOUVEAU_PE':
      erreur =
        "Veuillez vous connecter en choisissant France Travail sur l'application CEJ ou contacter votre conseiller pour recréer le compte"
      break
    case 'UTILISATEUR_DEJA_PE_BRSA':
      erreur =
        "Veuillez vous connecter en choisissant France Travail sur l'application Pass Emploi ou contacter votre conseiller pour recréer le compte"
      break
    case 'UTILISATEUR_NOUVEAU_PE_BRSA':
      erreur =
        "Veuillez vous connecter en choisissant France Travail sur l'application Pass Emploi ou contacter votre conseiller pour recréer le compte"
      break
    default:
      if (
        searchParams?.typeUtilisateur === 'CONSEILLER' &&
        (searchParams?.structureUtilisateur ===
          StructureConseiller.POLE_EMPLOI ||
          searchParams?.structureUtilisateur ===
            StructureConseiller.POLE_EMPLOI_BRSA)
      ) {
        erreur =
          'Veuillez vous connecter en choisissant France Travail CEJ / BRSA ou contacter le support'
      } else {
        erreur = 'Une erreur inconnue est survenue, veuillez réessayer'
      }
      if (searchParams?.reason) erreur += ` (code: ${searchParams.reason})`
      break
  }

  const utilisateur = {
    type: searchParams?.typeUtilisateur,
    structure: searchParams?.structureUtilisateur,
  }

  return <AuthErrorPage erreur={erreur} utilisateur={utilisateur} />
}
