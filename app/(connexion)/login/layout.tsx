import React, { ReactNode, Suspense } from 'react'

import LayoutLoginClient from 'app/(connexion)/login/LayoutLoginClient'
import A11yPageTitle from 'components/A11yPageTitle'
import { MODAL_ROOT_ID } from 'components/globals'

export default function LayoutLogin({ children }: { children: ReactNode }) {
  return (
    <>
      <A11yPageTitle />

      <Suspense>
        <LayoutLoginClient>{children}</LayoutLoginClient>
      </Suspense>

      <div id={MODAL_ROOT_ID} />
    </>
  )
}
