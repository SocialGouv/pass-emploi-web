import { Metadata } from 'next'
import React from 'react'

import LoginCEJPage from 'app/(connexion)/login/cej/LoginCEJPage'
import {
  LoginSearchParams,
  redirectIfAlreadyConnected,
} from 'app/(connexion)/login/layout'

export const metadata: Metadata = {
  title:
    "Connexion dans l'espace conseiller - Outil du Contrat d’Engagement Jeune",
}

export default async function LoginCEJ({
  searchParams,
}: {
  searchParams?: Promise<LoginSearchParams>
}) {
  await redirectIfAlreadyConnected(await searchParams)

  return <LoginCEJPage />
}
