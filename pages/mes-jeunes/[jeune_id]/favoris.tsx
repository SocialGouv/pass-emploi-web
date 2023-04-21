import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import { OngletOffres } from 'components/favoris/offres/OngletOffres'
import { OngletRecherches } from 'components/favoris/recherches/OngletRecherches'
import { TableauFavoris } from 'components/jeune/TableauFavoris'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { Offre, Recherche } from 'interfaces/favoris'
import { PageProps } from 'interfaces/pageProps'
import { FavorisService } from 'services/favoris.service'
import { JeunesService } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { ApiError } from 'utils/httpClient'
import withDependance from 'utils/injectionDependances/withDependance'

interface FavorisProps extends PageProps {
  lectureSeule: boolean
  offres: Offre[]
  recherches: Recherche[]
}

function Favoris({ offres, recherches, lectureSeule }: FavorisProps) {
  return (
    <TableauFavoris
      offres={offres}
      recherches={recherches}
      lectureSeule={lectureSeule}
    />
  )
}

export const getServerSideProps: GetServerSideProps<FavorisProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }
  const {
    session: { accessToken, user },
  } = sessionOrRedirect

  const jeunesService = withDependance<JeunesService>('jeunesService')
  const favorisService = withDependance<FavorisService>('favorisService')

  const jeuneId = context.query.jeune_id as string

  const beneficiaire = await jeunesService.getJeuneDetails(jeuneId, accessToken)

  if (!beneficiaire) {
    return { notFound: true }
  }

  const lectureSeule = beneficiaire.idConseiller !== user.id

  try {
    const offres = await favorisService.getOffres(jeuneId, accessToken)
    const recherches = await favorisService.getRecherchesSauvegardees(
      jeuneId,
      accessToken
    )
    return {
      props: {
        lectureSeule,
        offres,
        recherches,
        pageTitle: 'Favoris',
      },
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { redirect: { destination: '/mes-jeunes', permanent: false } }
    }
    throw error
  }
}

export default withTransaction(Favoris.name, 'page')(Favoris)
