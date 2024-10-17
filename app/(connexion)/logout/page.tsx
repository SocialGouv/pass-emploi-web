import { Metadata } from 'next'

import LogoutPage from 'app/(connexion)/logout/LogoutPage'
import { estUserPassEmploi } from 'interfaces/conseiller'
import { getSessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = { title: 'Déconnexion' }

export default async function Logout() {
  const session = await getSessionServerSide()
  const estPassEmploi = Boolean(!session || session.user === undefined)
    ? undefined
    : estUserPassEmploi(session!.user)

  return <LogoutPage estPassEmploi={estPassEmploi} />
}
