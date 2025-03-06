import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import OffrePage from 'app/(connected)/(with-sidebar)/(with-chat)/offres/[typeOffre]/[idOffre]/OffrePage'
import {
  PageFilArianePortal,
  PageHeaderPortal,
} from 'components/PageNavigationPortals'
import { DetailOffre } from 'interfaces/offre'
import { getImmersionServerSide } from 'services/immersions.service'
import { getOffreEmploiServerSide } from 'services/offres-emploi.service'
import { getServiceCiviqueServerSide } from 'services/services-civiques.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

type OffreParams = Promise<{ typeOffre: string; idOffre: string }>

export async function generateMetadata({
  params,
}: {
  params: OffreParams
}): Promise<Metadata> {
  const { offre } = await fetchOffre(params)
  return { title: `Détail de l’offre ${offre.titre} - Recherche d'offres` }
}

export default async function Offre({ params }: { params: OffreParams }) {
  const { offre, header } = await fetchOffre(params)

  return (
    <>
      <PageFilArianePortal />
      <PageHeaderPortal header={header} />

      <OffrePage offre={offre} />
    </>
  )
}

async function fetchOffre(
  params: OffreParams
): Promise<{ offre: DetailOffre; header: string }> {
  const { accessToken } = await getMandatorySessionServerSide()
  const { idOffre, typeOffre } = await params

  let offre: DetailOffre | undefined
  let header: string
  switch (typeOffre) {
    case 'emploi':
      offre = await getOffreEmploiServerSide(idOffre, accessToken)
      header = 'Offre d’emploi'
      break
    case 'alternance':
      offre = await getOffreEmploiServerSide(idOffre, accessToken)
      header = 'Offre d’alternance'
      break
    case 'service-civique':
      offre = await getServiceCiviqueServerSide(idOffre, accessToken)
      header = 'Offre de service civique'
      break
    case 'immersion':
      offre = await getImmersionServerSide(idOffre, accessToken)
      header = 'Offre d’immersion'
      break
    default:
      notFound()
  }

  if (!offre) notFound()
  return { offre, header }
}
