import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import {
  DetailOffreEmploi,
  DetailServiceCivique,
  TypeOffre,
} from 'interfaces/offre'
import { PageProps } from 'interfaces/pageProps'
import { OffresEmploiService } from 'services/offres-emploi.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'
import OffreEmploiDetail from 'components/offres/OffreEmploiDetail'
import ServiceCiviqueDetail from 'components/offres/ServiceCiviqueDetail'
import { ServicesCiviquesService } from 'services/services-civiques.service'

type DetailOffreProps = PageProps & {
  offre: DetailOffreEmploi | DetailServiceCivique
}

function DetailOffre({ offre }: DetailOffreProps) {
  const [labelMatomo, setLabelMatomo] = useState<string>('Détail offre')

  useMatomo(labelMatomo)

  return (
    <>
      {(offre.type === TypeOffre.EMPLOI ||
        offre.type === TypeOffre.ALTERNANCE) && (
        <OffreEmploiDetail offre={offre} setTrackingMatomo={setLabelMatomo} />
      )}
      {offre.type === TypeOffre.SERVICE_CIVIQUE && (
        <ServiceCiviqueDetail offre={offre} />
      )}
    </>
  )
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
  const serviceCiviqueService = withDependance<ServicesCiviquesService>(
    'servicesCiviquesService'
  )
  const typeOffre = context.query.offre_type as string

  let offre: DetailOffreEmploi | DetailServiceCivique | undefined

  if (typeOffre === 'service-civique') {
    offre = await serviceCiviqueService.getServiceCiviqueServerSide(
      context.query.offre_id as string,
      accessToken
    )
  } else {
    offre = await offresEmploiService.getOffreEmploiServerSide(
      context.query.offre_id as string,
      accessToken
    )
  }
  if (!offre) return { notFound: true }

  return {
    props: {
      offre,
      pageTitle: 'Détail de l‘offre',
      pageHeader: `Offre n°${offre.id}`,
    },
  }
}

export default withTransaction(DetailOffre.name, 'page')(DetailOffre)
