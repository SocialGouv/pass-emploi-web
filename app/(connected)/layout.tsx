import { Metadata } from 'next'
import React, { ReactNode } from 'react'

import { MODAL_ROOT_ID } from 'components/ids'
import LienEvitement from 'components/LienEvitement'
import { estConseilDepartemental, estPassEmploi } from 'interfaces/conseiller'
import { getBeneficiairesDuConseillerServerSide } from 'services/beneficiaires.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import AppContextProviders from 'utils/AppContextProviders'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

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

  return (
    <>
      <LienEvitement />

      <AppContextProviders conseiller={conseiller} portefeuille={portefeuille}>
        {children}
      </AppContextProviders>

      <div id={MODAL_ROOT_ID} />
    </>
  )
}
