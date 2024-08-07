import AuthErrorPage from 'app/autherror/AuthErrorPage'

type AuthErrorSearchParams = Partial<{
  reason?: string
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
    default:
      erreur =
        'Une erreur inconnue est survenue, veuillez réessayer ou contacter le support.'
      if (searchParams?.reason) erreur += ` (code: ${searchParams.reason})`
      break
  }

  return <AuthErrorPage erreur={erreur} />
}
