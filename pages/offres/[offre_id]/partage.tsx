import { GetServerSideProps } from 'next'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { PageProps } from 'interfaces/pageProps'
import { withTransaction } from '@elastic/apm-rum-react'
import { OffreEmploi } from 'interfaces/offre-emploi'

type PartageOffresProps = PageProps & {
  offre: OffreEmploi
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

  return {
    props: {
      pageTitle: 'Partager une offre',
      offre: { id: 'offre-prof', titre: 'prof' },
    },
  }
}

export default withTransaction(PartageOffre.name, 'page')(PartageOffre)
