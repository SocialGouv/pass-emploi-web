import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

function Home() {
  return <></>
}

export const getServerSideProps: GetServerSideProps<{}> = async (
  context
): Promise<GetServerSidePropsResult<{}>> => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)

  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const sourceQueryParam = context.query.source
    ? `?source=${context.query.source}`
    : ''

  return {
    redirect: {
      destination: `/mes-jeunes${sourceQueryParam}`,
      permanent: true,
    },
  }
}

export default withTransaction(Home.name, 'page')(Home)
