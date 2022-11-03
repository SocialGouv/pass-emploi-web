import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'

import { PageProps } from 'interfaces/pageProps'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

type PartageCritereProps = PageProps & {
  query: string
}

function PartageCritere({ query }: PartageCritereProps) {
  return <>{query}</>
}

export const getServerSideProps: GetServerSideProps<
  PartageCritereProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const q = context.query.criteres as string

  const buff = new Buffer(q, 'base64')
  const queryParams = buff.toString('utf-8')

  const props: PartageCritereProps = {
    pageTitle: 'Partager une offre',
    query: queryParams,
  }

  return { props }
}

export default withTransaction(PartageCritere.name, 'page')(PartageCritere)
