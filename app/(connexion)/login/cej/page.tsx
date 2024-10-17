import { Metadata } from 'next'
import React from 'react'

import LoginCEJPage from 'app/(connexion)/login/cej/LoginCEJPage'

export const metadata: Metadata = {
  title: "Connexion dans l'espace conseiller CEJ",
}

export default async function LoginCEJ() {
  return <LoginCEJPage />
}
