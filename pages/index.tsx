import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'

interface HomeProps {}

const Home = (props: HomeProps) => {}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context
): Promise<GetServerSidePropsResult<HomeProps>> => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  return {
    redirect: {
      destination: `/mes-jeunes`,
      permanent: true,
    },
  }
}

export default Home
