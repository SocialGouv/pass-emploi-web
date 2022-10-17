import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'

import { TutorielRaccourci } from 'components/TutorielRaccourci'
import { PageProps } from 'interfaces/pageProps'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

type RaccourciProps = PageProps & {
  withoutChat: true
}

const Raccourci = () => {
  useMatomo('Tuto raccourci mobile')

  return <TutorielRaccourci />
}

export const getServerSideProps: GetServerSideProps<RaccourciProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  return {
    props: {
      pageHeader: 'Créer un raccourci',
      pageTitle: 'Tutoriel raccourci mobile',
      withoutChat: true,
      returnTo: '/mes-jeunes',
    },
  }
}

export default withTransaction(Raccourci.name, 'page')(Raccourci)
