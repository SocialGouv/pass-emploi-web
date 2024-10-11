import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import React from 'react'

import LoginCEJPage from 'app/(connexion)/login/cej/LoginCEJPage'
import Footer from 'components/layouts/Footer'
import { getSessionServerSide } from 'utils/auth/auth'

type LoginCEJSearchParams = Partial<{
  source: string
  redirectUrl: string
}>

export const metadata: Metadata = {
  title: "Connexion dans l'espace conseiller CEJ",
}

export default async function LoginCEJ({
  searchParams,
}: {
  searchParams?: LoginCEJSearchParams
}) {
  await redirectIfAlreadyConnected(searchParams)

  return <LoginCEJPage />
}

async function redirectIfAlreadyConnected(
  searchParams?: LoginCEJSearchParams
): Promise<void> {
  const session = await getSessionServerSide()

  const querySource = searchParams?.source && `?source=${searchParams.source}`

  if (session) {
    const redirectUrl: string =
      searchParams?.redirectUrl ?? `/${querySource || ''}`
    redirect(redirectUrl)
  }
}
