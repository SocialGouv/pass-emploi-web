import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React from 'react'

import { TabFavoris } from 'components/jeune/TabFavoris'
import { Offre, Recherche } from 'interfaces/favoris'
import { PageProps } from 'interfaces/pageProps'
import { getOffres, getRecherchesSauvegardees } from 'services/favoris.service'
import { getJeuneDetails } from 'services/jeunes.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { ApiError } from 'utils/httpClient'

interface FavorisProps extends PageProps {
  lectureSeule: boolean
  offres: Offre[]
  recherches: Recherche[]
}

function Favoris({ offres, recherches, lectureSeule }: FavorisProps) {
  return (
    <TabFavoris
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

  const jeuneId = context.query.jeune_id as string

  const beneficiaire = await getJeuneDetails(jeuneId, accessToken)

  if (!beneficiaire) {
    return { notFound: true }
  }

  const lectureSeule = beneficiaire.idConseiller !== user.id

  try {
    const offres = await getOffres(jeuneId, accessToken)
    const recherches = await getRecherchesSauvegardees(jeuneId, accessToken)
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
