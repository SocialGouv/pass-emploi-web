import { Metadata } from 'next'
import React from 'react'

import LoginFranceTravailDispositifsPage from 'app/(connexion)/login/france-travail/dispositifs/LoginFranceTravailDispositifsPage'
import {
  LoginSearchParams,
  redirectIfAlreadyConnected,
} from 'app/(connexion)/login/layout'

export const metadata: Metadata = {
  title:
    'Sélection du dispositif France Travail - Outil du Contrat d’Engagement Jeune et du pass emploi',
}

export default async function LoginFranceTravailDispositifs({
  searchParams,
}: {
  searchParams?: Promise<LoginSearchParams>
}) {
  await redirectIfAlreadyConnected(await searchParams)

  return (
    <LoginFranceTravailDispositifsPage
      ssoAvenirProEstActif={
        process.env.NEXT_PUBLIC_ENABLE_AVENIR_PRO_SSO === 'true'
      }
    />
  )
}
