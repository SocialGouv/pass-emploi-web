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

export const metadata: Metadata = { title: 'Connexion' }

export default async function Login({
  searchParams,
}: {
  searchParams?: LoginSearchParams
}) {
  await redirectIfAlreadyConnected(searchParams)
  const isFromEmail = getIsFromEmail(searchParams)

  return (
    <div className='flex flex-col justify-center h-screen'>
      <LoginPage
        ssoPoleEmploiBRSAEstActif={
          process.env.NEXT_PUBLIC_ENABLE_PE_BRSA_SSO === 'true'
        }
        ssoPassEmploiEstActif={process.env.ENABLE_PASS_EMPLOI_SSO === 'true'}
        isFromEmail={isFromEmail}
      />
      <Footer />
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
      (searchParams?.redirectUrl as string) ?? `/${querySource || ''}`
    redirect(redirectUrl)
  }
}

function getIsFromEmail(searchParams?: LoginSearchParams): boolean {
  return Boolean(
    searchParams?.source ||
      (searchParams?.redirectUrl as string)?.includes('notif-mail')
  )
}
