import { Metadata } from 'next'
import React from 'react'

import {
  LoginSearchParams,
  redirectIfAlreadyConnected,
} from 'app/(connexion)/login/layout'
import LoginHubPage from 'app/(connexion)/login/LoginHubPage'

export const metadata: Metadata = {
  title:
    'Sélection de l’espace de connexion - Outil du Contrat d’Engagement Jeune et du pass emploi',
}

export default async function LoginHub({
  searchParams,
}: {
  searchParams?: Promise<LoginSearchParams>
}) {
  await redirectIfAlreadyConnected(await searchParams)

  return <LoginHubPage />
}
