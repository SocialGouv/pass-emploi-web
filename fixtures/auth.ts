import { Session } from 'next-auth'

export function unUtilisateur(
  overrides: Partial<Session.HydratedUser> = {}
): Session.HydratedUser {
  const utilisateur: Session.HydratedUser = {
    email: 'nils.tavernier@pass-emploi.fr',
    estConseiller: true,
    estSuperviseur: false,
    estSuperviseurResponsable: false,
    id: 'id-conseiller',
    image: undefined,
    name: 'Nils',
    structure: 'MILO',
  }

  return { ...utilisateur, ...overrides }
}
