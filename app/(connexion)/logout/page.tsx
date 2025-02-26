import { Metadata } from 'next'

import LogoutPage from 'app/(connexion)/logout/LogoutPage'
import { estFTConnect } from 'interfaces/structure'
import { getSessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = { title: 'Déconnexion' }

export default async function Logout() {
  let callbackUrl = '/login'

  const session = await getSessionServerSide()
  if (session && estFTConnect(session.user.structure))
    callbackUrl += '/france-travail'

  return <LogoutPage callbackUrl={callbackUrl} />
}
