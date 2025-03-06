import { Metadata } from 'next'
import React from 'react'

import ListesDiffusionPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/listes-de-diffusion/ListesDiffusionPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { getListesDeDiffusionServerSide } from 'services/listes-de-diffusion.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

export const metadata: Metadata = {
  title: 'Listes de diffusion - Portefeuille',
}

export default async function ListesDiffusion() {
  const { user, accessToken } = await getMandatorySessionServerSide()

  const listesDeDiffusion = await getListesDeDiffusionServerSide(
    user.id,
    accessToken
  )
  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Mes listes de diffusion' />

      <ListesDiffusionPage listesDiffusion={listesDeDiffusion} />
    </>
  )
}
