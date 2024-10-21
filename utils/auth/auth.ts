import apm, { UserObject } from 'elastic-apm-node'
import { redirect } from 'next/navigation'
import type { NextAuthOptions } from 'next-auth'
import { Account, getServerSession, Session } from 'next-auth'
import { HydratedJWT, JWT } from 'next-auth/jwt'
import KeycloakProvider from 'next-auth/providers/keycloak'
import { signIn } from 'next-auth/react'

import {
  handleJWTAndRefresh,
  RefreshAccessTokenError,
} from 'utils/auth/authenticator'

export const config = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || '',
      clientSecret: process.env.KEYCLOAK_SECRET || '',
      issuer: process.env.KEYCLOAK_ISSUER || '',
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({
      token: jwt,
      account,
    }: {
      token: JWT
      account?: Account | null
    }) {
      return handleJWTAndRefresh({ jwt, account })
    },

    async session({
      session,
      token,
    }: {
      session: Session
      token: HydratedJWT
    }) {
      session.user.id = token.idConseiller ?? ''
      session.user.structure = token.structureConseiller ?? ''
      session.user.estConseiller = token.estConseiller ?? false
      session.user.estSuperviseur = token.estSuperviseur ?? false
      session.user.estSuperviseurResponsable =
        token.estSuperviseurResponsable ?? false
      session.accessToken = token.accessToken ?? ''
      session.error = (token.error as string) ?? ''
      return session
    },
  },
} satisfies NextAuthOptions

// Use it in server contexts
export function getSessionServerSide(): Promise<Session | null> {
  return getServerSession(config)
}

export async function getMandatorySessionServerSide(): Promise<Session> {
  const session = await getSessionServerSide()
  if (!session) redirect('/login') // FIXME redirectUrl
  // const redirectQueryParam =
  //   resolvedUrl !== '/'
  //     ? `?${new URLSearchParams({ redirectUrl: resolvedUrl })}`
  //     : ''

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

export async function signin(
  provider: string,
  onError: (message: string) => void,
  redirectUrl?: string
) {
  try {
    const callbackUrl: string = redirectUrl
      ? '/?' + new URLSearchParams({ redirectUrl })
      : '/'
    await signIn('keycloak', { callbackUrl }, { kc_idp_hint: provider })
  } catch (error) {
    console.error(error)
    onError("une erreur est survenue lors de l'authentification")
  }
}
