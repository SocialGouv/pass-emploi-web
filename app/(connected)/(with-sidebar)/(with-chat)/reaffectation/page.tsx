import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import ReaffectationPage from 'app/(connected)/(with-sidebar)/(with-chat)/reaffectation/ReaffectationPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

export const metadata: Metadata = { title: 'Réaffectation' }
export default async function Reaffectation() {
  const { user } = await getMandatorySessionServerSide()
  if (!user.estSuperviseur) notFound()

  return (
    <>
      <PageHeaderPortal header='Réaffectation' />

      <ReaffectationPage
        estSuperviseurResponsable={user.estSuperviseurResponsable}
      />
    </>
  )
}
