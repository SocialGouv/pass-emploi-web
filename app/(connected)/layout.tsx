import { Metadata } from 'next'
import React, { ReactNode } from 'react'

import A11yPageTitle from 'components/A11yPageTitle'
import { MODAL_ROOT_ID } from 'components/globals'
import LiensEvitement from 'components/LiensEvitement'
import { estUserPassEmploi } from 'interfaces/conseiller'
import { getBeneficiairesDuConseillerServerSide } from 'services/beneficiaires.service'
import { getConseillerServerSide } from 'services/conseillers.service'
import AppContextProviders from 'utils/AppContextProviders'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export async function generateMetadata(): Promise<Metadata> {
  const { user } = await getMandatorySessionServerSide()
  const siteTitle =
    'Espace conseiller ' + (estUserPassEmploi(user) ? 'pass emploi' : 'CEJ')
  const faviconPath = estUserPassEmploi(user)
    ? '/pass-emploi-favicon.png'
    : '/cej-favicon.png'

  return {
    title: { template: '%s - ' + siteTitle, default: siteTitle },
    icons: {
      icon: faviconPath,
      shortcut: faviconPath,
      apple: faviconPath,
    },
  }
}

export default async function LayoutWhenConnected({
  children,
}: {
  children: ReactNode
}) {
  const { accessToken, user } = await getMandatorySessionServerSide()

  const [conseiller, portefeuille] = await Promise.all([
    getConseillerServerSide(user, accessToken),
    getBeneficiairesDuConseillerServerSide(user.id, accessToken),
  ])

  return (
    <>
      <AppContextProviders conseiller={conseiller} portefeuille={portefeuille}>
        <A11yPageTitle />
        <LiensEvitement />

        {children}
      </AppContextProviders>

      <div id={MODAL_ROOT_ID} />
    </>
  )
}
