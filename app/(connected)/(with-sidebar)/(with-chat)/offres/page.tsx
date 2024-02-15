import { Metadata } from 'next'
import React from 'react'

import RechercheOffresPage from 'app/(connected)/(with-sidebar)/(with-chat)/offres/RechercheOffresPage'
import { PageHeaderPortal } from 'components/PageNavigationPortals'

export const metadata: Metadata = { title: 'Recherche d’offres' }

export default async function RechercheOffres() {
  return (
    <>
      <PageHeaderPortal header='Offres' />

      <RechercheOffresPage />
    </>
  )
}
