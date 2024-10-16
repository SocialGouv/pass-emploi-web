import { Metadata } from 'next'
import React from 'react'

import {
  LoginSearchParams,
  redirectIfAlreadyConnected,
} from 'app/(connexion)/login/layout'
import LoginHubPage from 'app/(connexion)/login/LoginHubPage'

export const metadata: Metadata = {
  title: 'Sélection de l’espace de connexion',
}

export default async function LoginHub({
  searchParams,
}: {
  searchParams?: LoginSearchParams
}) {
  await redirectIfAlreadyConnected(searchParams)

  return <LoginHubPage />
}
