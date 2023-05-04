import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React from 'react'

import ConversationImage from 'assets/images/conversation.svg'
import { estMilo, estUserPoleEmploi } from 'interfaces/conseiller'
import { PageProps } from 'interfaces/pageProps'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

function Messagerie(_: PageProps) {
  const trackingTitle = 'Messagerie'

  useMatomo(trackingTitle)

  return (
    <div className='flex flex-col justify-center items-center h-full'>
      <ConversationImage focusable={false} aria-hidden={true} />
      <p className='mt-4 text-base-medium w-2/3 text-center'>
        Bienvenue dans votre espace de messagerie.
      </p>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }
  const {
    session: { user },
  } = sessionOrRedirect
  if (estMilo(user)) {
    return { notFound: true }
  }

  const props: PageProps = {
    pageTitle: 'Messagerie',
    pageHeader: 'Messagerie',
  }

  return { props }
}

export default withTransaction(Messagerie.name, 'page')(Messagerie)
