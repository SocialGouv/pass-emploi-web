import { Metadata } from 'next'
import React, { ReactNode } from 'react'

import A11yPageTitle from 'components/A11yPageTitle'
import { MODAL_ROOT_ID } from 'components/globals'
import LiensEvitement from 'components/LiensEvitement'
import { estPassEmploi } from 'interfaces/conseiller'
import { getBeneficiairesDuConseillerServerSide } from 'services/beneficiaires.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import AppContextProviders from 'utils/AppContextProviders'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

export async function generateMetadata(): Promise<Metadata> {
  const { accessToken, user } = await getMandatorySessionServerSide()
  const conseiller = await getConseillerServerSide(user, accessToken)
  const siteTitle =
    'Espace conseiller ' + (estPassEmploi(conseiller) ? 'pass emploi' : 'CEJ')
  const faviconPath = estPassEmploi(conseiller)
    ? '/pass-emploi_favicon.png'
    : '/cej_favicon.png'

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
