import { Redirect } from 'next'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { GetServerSidePropsContext } from 'next/types'

export async function withMandatorySessionOrRedirect(
  context: GetServerSidePropsContext
): Promise<
  | { redirect: Redirect; hasSession: false }
  | { session: Session; hasSession: true }
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
      hasSession: false,
    }
  }
  if (session.error === 'RefreshAccessTokenError') {
    return {
      redirect: {
        destination: `/api/auth/federated-logout`,
        permanent: false,
      },
      hasSession: false,
    }
  }
  return { session, hasSession: true }
}
