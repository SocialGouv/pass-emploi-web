import { Metadata } from 'next'

import LogoutPage from 'app/(connexion)/logout/LogoutPage'
import { estUserPassEmploi } from 'interfaces/conseiller'
import { getSessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = { title: 'Déconnexion' }

export default async function Logout() {
  let callbackUrl = '/login'
  const session = await getSessionServerSide()
  if (session) {
    callbackUrl +=
      '/' + (estUserPassEmploi(session.user) ? 'passemploi' : 'cej')
  }

  return <LogoutPage callbackUrl={callbackUrl} />
}
