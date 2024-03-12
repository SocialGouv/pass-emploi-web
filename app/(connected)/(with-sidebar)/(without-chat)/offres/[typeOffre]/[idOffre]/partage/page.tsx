import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

import PartageOffrePage from 'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/[idOffre]/partage/PartageOffrePage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import { utiliseChat } from 'interfaces/conseiller'
import { DetailOffre } from 'interfaces/offre'
import { getImmersionServerSide } from 'services/immersions.service'
import { getOffreEmploiServerSide } from 'services/offres-emploi.service'
import { getServiceCiviqueServerSide } from 'services/services-civiques.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'
import redirectedFromHome from 'utils/redirectedFromHome'

type PartageOffreParams = { typeOffre: string; idOffre: string }

export async function generateMetadata({
  params,
}: {
  params: PartageOffreParams
}): Promise<Metadata> {
  const offre = await fetchOffre(params)
  return { title: `Partage de l’offre ${offre.titre} - Recherche d’offres` }
}

export default async function PartageOffre({
  params,
}: {
  params: PartageOffreParams
}) {
  const { user } = await getMandatorySessionServerSide()
  if (!utiliseChat(user)) notFound()

  const offre = await fetchOffre(params)

  const referer = headers().get('referer')
  const redirectTo =
    referer && !redirectedFromHome(referer) ? referer : '/offres'

  return (
    <>
      <PageRetourPortal lien={redirectTo} />
      <PageHeaderPortal header='Partager une offre' />

      <PartageOffrePage offre={offre} returnTo={redirectTo} />
    </>
  )
}

async function fetchOffre({
  typeOffre,
  idOffre,
}: PartageOffreParams): Promise<DetailOffre> {
  const { accessToken } = await getMandatorySessionServerSide()
  let offre: DetailOffre | undefined
  switch (typeOffre) {
    case 'emploi':
    case 'alternance':
      offre = await getOffreEmploiServerSide(idOffre, accessToken)
      break
    case 'service-civique':
      offre = await getServiceCiviqueServerSide(idOffre, accessToken)
      break
    case 'immersion':
      offre = await getImmersionServerSide(idOffre, accessToken)
      break
    default:
      notFound()
  }

  if (!offre) notFound()
  return offre
}
