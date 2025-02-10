import { Metadata } from 'next'
import React from 'react'

import LoginFranceTravailPage from 'app/(connexion)/login/france-travail/LoginFranceTravailPage'
import {
  LoginSearchParams,
  redirectIfAlreadyConnected,
} from 'app/(connexion)/login/layout'

export const metadata: Metadata = {
  title:
    'Connexion France Travail - Outil du Contrat d’Engagement Jeune et du pass emploi',
}

export default async function LoginFranceTravail({
  searchParams,
}: {
  searchParams?: Promise<LoginSearchParams>
}) {
  await redirectIfAlreadyConnected(await searchParams)

  return <LoginFranceTravailPage />
}
