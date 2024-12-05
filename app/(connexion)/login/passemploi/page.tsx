import { Metadata } from 'next'
import React from 'react'

import {
  LoginSearchParams,
  redirectIfAlreadyConnected,
} from 'app/(connexion)/login/layout'
import LoginPassEmploiPage from 'app/(connexion)/login/passemploi/LoginPassEmploiPage'

export const metadata: Metadata = {
  title: "Connexion dans l'espace conseiller - Outil du pass emploi",
}

export default async function LoginPassEmploi({
  searchParams,
}: {
  searchParams?: LoginSearchParams
}) {
  await redirectIfAlreadyConnected(searchParams)

  return (
    <LoginPassEmploiPage
      ssoAvenirProEstActif={
        process.env.NEXT_PUBLIC_ENABLE_AVENIR_PRO_SSO === 'true'
      }
    />
  )
}
