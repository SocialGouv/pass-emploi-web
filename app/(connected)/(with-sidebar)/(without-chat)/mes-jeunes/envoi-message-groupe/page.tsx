import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

import EnvoiMessageGroupePage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/envoi-message-groupe/EnvoiMessageGroupePage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { utiliseChat } from 'interfaces/conseiller'
import { getListesServerSide } from 'services/listes.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'
import { redirectedFromHome } from 'utils/helpers'

export const metadata: Metadata = { title: 'Message multi-destinataires' }

export default async function EnvoiMessageGroupe() {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!utiliseChat(user)) notFound()

  const listes = await getListesServerSide(user.id, accessToken)

  const referer = (await headers()).get('referer')
  const previousUrl =
    referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'

  return (
    <>
      <PageRetourPortal lien={previousUrl} />
      <PageHeaderPortal header='Message multi-destinataires' />

      <EnvoiMessageGroupePage listes={listes} returnTo={previousUrl} />
    </>
  )
}
