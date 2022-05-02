import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'

import RenseignementAgenceModal from 'components/RenseignementAgenceModal'
import { UserStructure } from 'interfaces/conseiller'
import { ConseillerService } from 'services/conseiller.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

interface HomePageProps {
  redirectUrl: string
  structureConseiller: string
}

function Home({ redirectUrl, structureConseiller }: HomePageProps) {
  const router = useRouter()

  async function redirectToUrl() {
    await router.replace(redirectUrl)
  }

  return (
    <>
      <RenseignementAgenceModal
        structureConseiller={structureConseiller}
        onClose={redirectToUrl}
      />
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
    throw new Error(`Conseiller ${user.id} innexistant`)
  }

  const redirectUrl = (context.query.redirectUrl as string) ?? '/mes-jeunes'

  if (
    Boolean(conseiller.agence) ||
    user.structure === UserStructure.PASS_EMPLOI
  ) {
    return {
      redirect: {
        destination: `${redirectUrl}${sourceQueryParam}`,
        permanent: true,
      },
    }
  }

  return {
    props: {
      redirectUrl,
      structureConseiller: user.structure,
    },
  }
}

export default withTransaction(Home.name, 'page')(Home)
