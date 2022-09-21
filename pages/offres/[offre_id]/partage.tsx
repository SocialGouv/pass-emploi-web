import { GetServerSideProps } from 'next'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { PageProps } from 'interfaces/pageProps'
import { withTransaction } from '@elastic/apm-rum-react'

type PartageOffresProps = PageProps
// ajouter l'autre props

function PartageOffre({ offre }: PartageOffresProps) {}

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
