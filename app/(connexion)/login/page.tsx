import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import React from 'react'

import LoginPage from 'app/(connexion)/login/LoginPage'
import Footer from 'components/layouts/Footer'
import { getSessionServerSide } from 'utils/auth/auth'

type LoginSearchParams = Partial<{
  source: string
  redirectUrl: string
}>

export const metadata: Metadata = {
  title: "Connexion dans l'espace conseiller CEJ",
}

export default async function Login({
  searchParams,
}: {
  searchParams?: LoginSearchParams
}) {
  await redirectIfAlreadyConnected(searchParams)
  const isFromEmail = getIsFromEmail(searchParams)

  return (
    <div className='flex flex-col justify-center h-screen w-screen'>
      <header role='banner' className='bg-primary_lighten'>
        <h1 className='text-m-bold text-primary_darken text-center mt-[48px] mb-[24px]'>
          Connectez-vous à l&apos;espace conseiller
        </h1>
      </header>

      <LoginPage
        ssoFranceTravailBRSAEstActif={
          process.env.NEXT_PUBLIC_ENABLE_PE_BRSA_SSO === 'true'
        }
        ssoFranceTravailAIJEstActif={
          process.env.NEXT_PUBLIC_ENABLE_PE_AIJ_SSO === 'true'
        }
        isFromEmail={isFromEmail}
      />

      <Footer conseiller={null} aDesBeneficiaires={null} />
    </div>
  )
}

async function redirectIfAlreadyConnected(
  searchParams?: LoginSearchParams
): Promise<void> {
  const session = await getSessionServerSide()

  const querySource = searchParams?.source && `?source=${searchParams.source}`

  if (session) {
    const redirectUrl: string =
      searchParams?.redirectUrl ?? `/${querySource || ''}`
    redirect(redirectUrl)
  }
}

function getIsFromEmail(searchParams?: LoginSearchParams): boolean {
  return Boolean(
    searchParams?.source || searchParams?.redirectUrl?.includes('notif-mail')
  )
}
