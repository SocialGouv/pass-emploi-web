import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useEffect, useState } from 'react'

import RenseignementModal from 'components/RenseignementModal'
import { Conseiller } from 'interfaces/conseiller'
import { ConseillerService } from 'services/conseiller.service'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface HomePageProps {
  conseiller: Conseiller
}

function Home({ conseiller }: HomePageProps) {
  const { data: session } = useSession({ required: true })

  return (
    <>
      {!conseiller?.agence?.id && (
        <RenseignementModal typeStructure={session?.user?.structure} />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (
  context
): Promise<GetServerSidePropsResult<HomePageProps>> => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)

  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect

  const sourceQueryParam = context.query.source
    ? `?source=${context.query.source}`
    : ''

  const conseillerService =
    withDependance<ConseillerService>('conseillerService')

  const conseiller = await conseillerService.getConseiller(user.id, accessToken)

  if (!conseiller) {
    return { notFound: true }
  }

  if (conseiller?.agence?.id) {
    return {
      redirect: {
        destination: `/mes-jeunes${sourceQueryParam}`,
        permanent: true,
      },
    }
  }

  return {
    props: {
      conseiller: conseiller,
    },
  }
}

export default withTransaction(Home.name, 'page')(Home)
