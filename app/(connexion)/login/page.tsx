import { Metadata } from 'next'
import React from 'react'

import LoginHubPage from 'app/(connexion)/login/LoginHubPage'

export const metadata: Metadata = {
  title: 'Sélection de l’espace de connexion',
}

export default async function Login() {
  return <LoginHubPage />
}
