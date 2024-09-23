import { Metadata } from 'next'
import React, { ReactNode } from 'react'

import { MODAL_ROOT_ID } from 'components/ids'
import LienEvitement from 'components/LienEvitement'
import { estPassEmploi } from 'interfaces/conseiller'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getJeunesDuConseillerServerSide } from 'services/jeunes.service'
import AppContextProviders from 'utils/AppContextProviders'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

async function getWordPressPage() {
  const res = await fetch(
    'https://doc.pass-emploi.beta.gouv.fr/wp-json/wp/v2/pages/796'
  )

  if (!res.ok) {
    throw new Error('Erreur lors de la récupération des données WordPress')
  }

  const data = await res.json()
  return data
}

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
    getJeunesDuConseillerServerSide(user.id, accessToken),
  ])
  const theme = estPassEmploi(conseiller) ? 'pass-emploi' : 'cej'

  const actualitesData = await getWordPressPage()

  return (
    <>
      <LienEvitement />

      <AppContextProviders
        conseiller={conseiller}
        portefeuille={portefeuille}
        theme={theme}
        actualitesData={actualitesData}
      >
        {children}
      </AppContextProviders>

      <div id={MODAL_ROOT_ID} />
    </>
  )
}
