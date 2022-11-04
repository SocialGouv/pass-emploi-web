import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import ImmersionDetail from 'components/offres/ImmersionDetail'
import OffreEmploiDetail from 'components/offres/OffreEmploiDetail'
import ServiceCiviqueDetail from 'components/offres/ServiceCiviqueDetail'
import { DetailOffre as _DetailOffre, TypeOffre } from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { ImmersionsService } from 'services/immersions.service'
import { OffresEmploiService } from 'services/offres-emploi.service'
import { ServicesCiviquesService } from 'services/services-civiques.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

type DetailOffreProps = PageProps & {
  offre: _DetailOffre
}

function DetailOffre({ offre }: DetailOffreProps) {
  const [labelMatomo, setLabelMatomo] = useState<string>('Détail offre')

  function getDetailOffre() {
    switch (offre.type) {
      case TypeOffre.EMPLOI:
      case TypeOffre.ALTERNANCE:
        return (
          <OffreEmploiDetail offre={offre} onLienExterne={setLabelMatomo} />
        )
      case TypeOffre.SERVICE_CIVIQUE:
        return (
          <ServiceCiviqueDetail offre={offre} onLienExterne={setLabelMatomo} />
        )
      case TypeOffre.IMMERSION:
        return <ImmersionDetail offre={offre} />
    }
  }

  useMatomo(labelMatomo)

  return getDetailOffre()
}

export const getServerSideProps: GetServerSideProps<DetailOffreProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { accessToken } = sessionOrRedirect.session
  const offresEmploiService = withDependance<OffresEmploiService>(
    'offresEmploiService'
  )
  const servicesCiviquesService = withDependance<ServicesCiviquesService>(
    'servicesCiviquesService'
  )
  const immersionsService =
    withDependance<ImmersionsService>('immersionsService')
  const typeOffre = context.query.offre_type as string

  let offre: _DetailOffre | undefined
  let header: string
  switch (typeOffre) {
    case 'emploi':
      offre = await offresEmploiService.getOffreEmploiServerSide(
        context.query.offre_id as string,
        accessToken
      )
      header =
        offre?.type === TypeOffre.ALTERNANCE
          ? 'Offre d’alternance'
          : 'Offre d’emploi'
      break
    case 'service-civique':
      offre = await servicesCiviquesService.getServiceCiviqueServerSide(
        context.query.offre_id as string,
        accessToken
      )
      header = 'Offre de service civique'
      break
    case 'immersion':
      offre = await immersionsService.getImmersionServerSide(
        context.query.offre_id as string,
        accessToken
      )
      header = 'Offre d’immersion'
      break
  }

  if (!offre) return { notFound: true }

  return {
    props: {
      offre,
      pageTitle: 'Recherche d’offres - Détail de l’offre',
      pageHeader: header!,
    },
  }
}

export default withTransaction(DetailOffre.name, 'page')(DetailOffre)
