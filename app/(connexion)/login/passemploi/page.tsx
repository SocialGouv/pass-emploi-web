import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import React from 'react'

import LoginPassEmploiPage from 'app/(connexion)/login/passemploi/LoginPassEmploiPage'
import Footer from 'components/layouts/Footer'
import { getSessionServerSide } from 'utils/auth/auth'

type LoginPassEmploiSearchParams = Partial<{
  source: string
  redirectUrl: string
}>

export const metadata: Metadata = {
  title: "Connexion dans l'espace conseiller Pass Emploi",
}

export default async function LoginPassEmploi({
  searchParams,
}: {
  searchParams?: LoginPassEmploiSearchParams
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

async function redirectIfAlreadyConnected(
  searchParams?: LoginPassEmploiSearchParams
): Promise<void> {
  const session = await getSessionServerSide()

  const querySource = searchParams?.source && `?source=${searchParams.source}`

  if (session) {
    const redirectUrl: string =
      searchParams?.redirectUrl ?? `/${querySource || ''}`
    redirect(redirectUrl)
  }
}
