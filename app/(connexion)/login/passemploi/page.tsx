import { Metadata } from 'next'
import React from 'react'

import {
  LoginSearchParams,
  redirectIfAlreadyConnected,
} from 'app/(connexion)/login/layout'
import LoginPassEmploiPage from 'app/(connexion)/login/passemploi/LoginPassEmploiPage'

export const metadata: Metadata = {
  title: "Connexion dans l'espace conseiller Pass Emploi",
}

export default async function LoginPassEmploi({
  searchParams,
}: {
  searchParams?: LoginSearchParams
}) {
  await redirectIfAlreadyConnected(searchParams)

  return (
    <LoginPassEmploiPage
      ssoFranceTravailBRSAEstActif={
        process.env.NEXT_PUBLIC_ENABLE_PE_BRSA_SSO === 'true'
      }
      ssoFranceTravailAIJEstActif={
        process.env.NEXT_PUBLIC_ENABLE_PE_AIJ_SSO === 'true'
      }
      ssoConseillerDeptEstActif={
        process.env.NEXT_PUBLIC_ENABLE_CONSEILLER_DEPT_SSO === 'true'
      }
    />
  )
}
