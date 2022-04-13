import apm, { UserObject } from 'elastic-apm-node'
import { Redirect } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { GetServerSidePropsContext } from 'next/types'

export async function withMandatorySessionOrRedirect(
  context: GetServerSidePropsContext
): Promise<
  | { validSession: false; redirect: Redirect }
  | { validSession: true; session: Session }
> {
  const session = await getSession({ req: context.req })
  if (!session) {
    const redirectUrl: string = context.resolvedUrl
    const redirectQueryParam =
      redirectUrl !== '/'
        ? `?${new URLSearchParams({ redirectUrl: redirectUrl })}`
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
        permanent: true,
      },
      validSession: false,
    }
  }

  if (session.error === 'RefreshAccessTokenError') {
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
