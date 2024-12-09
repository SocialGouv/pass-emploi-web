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
import { getListesDeDiffusionServerSide } from 'services/listes-de-diffusion.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import { redirectedFromHome } from 'utils/helpers'

export const metadata: Metadata = { title: 'Message multi-destinataires' }

export default async function EnvoiMessageGroupe() {
  const { user, accessToken } = await getMandatorySessionServerSide()
  if (!utiliseChat(user)) notFound()

  const listesDeDiffusion = await getListesDeDiffusionServerSide(
    user.id,
    accessToken
  )

  const referer = (await headers()).get('referer')
  const previousUrl =
    referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'

  return (
    <>
      <PageRetourPortal lien={previousUrl} />
      <PageHeaderPortal header='Message multi-destinataires' />

      <EnvoiMessageGroupePage
        listesDiffusion={listesDeDiffusion}
        returnTo={previousUrl}
      />
    </>
  )
}
