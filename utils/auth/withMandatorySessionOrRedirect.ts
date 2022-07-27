import apm, { UserObject } from 'elastic-apm-node'
import { Redirect } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { GetServerSidePropsContext } from 'next/types'

import { RefreshAccessTokenError } from 'utils/auth/authenticator'

export async function withMandatorySessionOrRedirect({
  req,
  resolvedUrl,
}: GetServerSidePropsContext): Promise<
  | { validSession: false; redirect: Redirect }
  | { validSession: true; session: Session }
> {
  // FIXME https://next-auth.js.org/configuration/nextjs#unstable_getserversession
  const session = await getSession({ req })
  if (!session) {
    const redirectQueryParam =
      resolvedUrl !== '/'
        ? `?${new URLSearchParams({ redirectUrl: resolvedUrl })}`
        : ''
    return {
      redirect: {
        destination: `/login${redirectQueryParam}`,
        permanent: false,
      },
      validSession: false,
    }
  }

  if (!session.user.estConseiller) {
    return {
      redirect: {
        destination: '/api/auth/federated-logout',
        permanent: false,
      },
      validSession: false,
    }
  }

  if (session.error === RefreshAccessTokenError) {
    return {
      redirect: {
        destination: `/api/auth/federated-logout`,
        permanent: false,
      },
      validSession: false,
    }
  }

  const { user }: Session = session
  const userAPM: UserObject = {
    id: user.id,
    username: `${user.name}-${user.structure}`,
    email: user.email ?? '',
  }
  apm.setUserContext(userAPM)
  return { session, validSession: true }
}
