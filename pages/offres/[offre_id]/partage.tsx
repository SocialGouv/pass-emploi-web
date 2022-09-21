import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'

import { DetailOffreEmploi } from 'interfaces/offre-emploi'
import { PageProps } from 'interfaces/pageProps'
import { OffresEmploiService } from 'services/offres-emploi.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

type PartageOffresProps = PageProps & {
  offre: DetailOffreEmploi
}

function PartageOffre({ offre }: PartageOffresProps) {
  return (
    <>
      <p>Offre n°{offre.id}</p>
      <p>{offre.titre}</p>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  PartageOffresProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { accessToken } = sessionOrRedirect.session
  const offresEmploiService = withDependance<OffresEmploiService>(
    'offresEmploiService'
  )

  const offre = await offresEmploiService.getOffreEmploiServerSide(
    context.query.offre_id as string,
    accessToken
  )
  if (!offre) return { notFound: true }

  return {
    props: {
      pageTitle: 'Partager une offre',
      offre,
    },
  }
}

export default withTransaction(PartageOffre.name, 'page')(PartageOffre)
