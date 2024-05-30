import AuthErrorPage from 'app/autherror/AuthErrorPage'
import { StructureConseiller } from 'interfaces/conseiller'

type AuthErrorSearchParams = Partial<{
  reason: string
  utilisateur: 'beneficiaire' | 'conseiller'
  structure: StructureConseiller
}>

export default function AuthError({
  searchParams,
}: {
  searchParams?: AuthErrorSearchParams
}) {
  let erreur: string
  switch (searchParams?.reason) {
    case 'UTILISATEUR_INEXISTANT':
      erreur = 'Aucun utilisateur trouvé, veuillez contacter votre conseiller'
      break
    default:
      erreur = 'Une erreur inconnue est survenue'
      if (searchParams?.reason) erreur += ` (code: ${searchParams.reason})`
      break
  }

  const utilisateur = {
    type: searchParams?.utilisateur,
    structure: searchParams?.structure,
  }

  return <AuthErrorPage erreur={erreur} utilisateur={utilisateur} />
}
