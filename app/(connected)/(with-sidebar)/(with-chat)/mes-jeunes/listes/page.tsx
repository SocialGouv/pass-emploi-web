import { Metadata } from 'next'
import React from 'react'

import ListesPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/listes/ListesPage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { getListesServerSide } from 'services/listes.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

export const metadata: Metadata = {
  title: 'Listes - Portefeuille',
}

export default async function Listes() {
  const { user, accessToken } = await getMandatorySessionServerSide()

  const listes = await getListesServerSide(user.id, accessToken)
  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header='Mes listes' />

      <ListesPage listes={listes} />
    </>
  )
}
