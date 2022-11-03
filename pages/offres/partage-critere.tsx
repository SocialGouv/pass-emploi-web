import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { PageProps } from 'interfaces/pageProps'

type PartageCritereProps = PageProps & {
  query: string
}

function PartageCritere({ query }) {
  function decode(query: string) {
    let buff = new Buffer(query, 'base64')
    let queryParams = buff.toString('utf-8')
    return queryParams
  }

  return <>{decode(query)}</>
}

export const getServerSideProps: GetServerSideProps<
  PartageCritereProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const q = context.query.criteres

  const props: PartageCritereProps = {
    pageTitle: 'Partager une offre',
    query: q as string,
  }

  return { props }
}

export default withTransaction(PartageCritere.name, 'page')(PartageCritere)
