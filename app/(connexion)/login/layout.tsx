import { redirect } from 'next/navigation'
import React, { ReactNode, Suspense } from 'react'

import LayoutLoginClient from 'app/(connexion)/login/LayoutLoginClient'
import { MODAL_ROOT_ID } from 'components/globals'
import { getSessionServerSide } from 'utils/auth/auth'

export default function LayoutLogin({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense>
        <LayoutLoginClient>{children}</LayoutLoginClient>
      </Suspense>

      <div id={MODAL_ROOT_ID} />
    </>
  )
}

export type LoginSearchParams = Partial<{
  source: string
  redirectUrl: string
}>

export async function redirectIfAlreadyConnected(
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
