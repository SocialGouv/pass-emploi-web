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
import { getActualites } from 'services/actualites.service'

export async function generateMetadata(): Promise<Metadata> {
  const { accessToken, user } = await getMandatorySessionServerSide()
  const conseiller = await getConseillerServerSide(user, accessToken)
  const siteTitle =
    'Espace conseiller ' + (estPassEmploi(conseiller) ? 'pass emploi' : 'CEJ')

  return { title: { template: '%s - ' + siteTitle, default: siteTitle } }
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

  const actualitesData = await getActualites()

  return (
    <>
      <AppContextProviders
        conseiller={conseiller}
        portefeuille={portefeuille}
        actualitesData={actualitesData}
      >
        <A11yPageTitle />
        <LiensEvitement />

        {children}
      </AppContextProviders>

      <div id={MODAL_ROOT_ID} />
    </>
  )
}
