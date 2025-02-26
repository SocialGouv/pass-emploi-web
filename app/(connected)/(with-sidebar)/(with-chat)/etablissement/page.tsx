import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import EtablissementPage from 'app/(connected)/(with-sidebar)/(with-chat)/etablissement/EtablissementPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'
import { estMilo } from 'interfaces/structure'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export const metadata: Metadata = { title: 'Établissement' }

export default async function Etablissement() {
  const { user } = await getMandatorySessionServerSide()
  if (!estMilo(user.structure)) notFound()

  return (
    <>
      <PageHeaderPortal header='Rechercher un bénéficiaire de ma Mission Locale' />

      <EtablissementPage />
    </>
  )
}
