import { Metadata } from 'next'

import LogoutPage from 'app/(connexion)/logout/LogoutPage'

export const metadata: Metadata = { title: 'Déconnexion' }

export default function Logout() {
  return <LogoutPage />
}
