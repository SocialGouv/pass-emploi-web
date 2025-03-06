import apm, { UserObject } from 'elastic-apm-node'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Session } from 'next-auth'

import { getSessionServerSide } from 'utils/auth/auth'
import { RefreshAccessTokenError } from 'utils/auth/authenticator'

export default async function getMandatorySessionServerSide(): Promise<Session> {
  const session = await getSessionServerSide()
  if (!session) {
    const headersList = await headers()
    const currentPath = headersList.get('x-current-path')
    const redirectQueryParam = currentPath
      ? `?${new URLSearchParams({ redirectUrl: currentPath })}`
      : ''
    redirect('/login' + redirectQueryParam)
  }

  if (!session.user.estConseiller) redirect('/api/auth/federated-logout')

  if (session.error === RefreshAccessTokenError)
    redirect('/api/auth/federated-logout')

  const { user }: Session = session
  const userAPM: UserObject = {
    id: user.id,
    username: `${user.name}-${user.structure}`,
    email: user.email ?? '',
  }
  apm.setUserContext(userAPM)
  return session
}
