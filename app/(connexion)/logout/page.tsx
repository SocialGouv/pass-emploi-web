import { Metadata } from 'next'

import LogoutPage from 'app/(connexion)/logout/LogoutPage'
import { estUserFT } from 'interfaces/conseiller'
import { getSessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = { title: 'Déconnexion' }

export default async function Logout() {
  let callbackUrl = '/login'

  const session = await getSessionServerSide()
  if (session && estUserFT(session.user))
    callbackUrl += '/france-travail/dispositifs'

  return <LogoutPage callbackUrl={callbackUrl} />
}
