import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'

import RenseignementModal from 'components/RenseignementModal'
import { Conseiller, UserStructure } from 'interfaces/conseiller'
import { ConseillerService } from 'services/conseiller.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

interface HomePageProps {
  conseiller: Conseiller
  structureConseiller: string
}

function Home({ conseiller, structureConseiller }: HomePageProps) {
  const isPoleEmploi = structureConseiller === UserStructure.POLE_EMPLOI
  const isMilo = structureConseiller === UserStructure.MILO

  const type =
    structureConseiller === UserStructure.MILO ? 'Mission locale' : 'agence'

  return (
    <>
      {isPoleEmploi && !conseiller?.agence?.id && (
        <RenseignementModal structureConseiller={type} onClose={() => ({})} />
      )}
      {isMilo && !conseiller?.agence?.id && (
        <RenseignementModal structureConseiller={type} onClose={() => ({})} />
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
      structureConseiller: user.structure,
    },
  }
}

export default withTransaction(Home.name, 'page')(Home)
