import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import type { NextAuthOptions } from 'next-auth'
import { Account, getServerSession, Session } from 'next-auth'
import { HydratedJWT, JWT } from 'next-auth/jwt'
import KeycloakProvider from 'next-auth/providers/keycloak'

import { handleJWTAndRefresh } from 'utils/auth/authenticator'

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
      session.user.estSuperviseurPEBRSA = token.estSuperviseurPEBRSA ?? false
      session.accessToken = token.accessToken ?? ''
      session.error = (token.error as string) ?? ''
      return session
    },
  },
} satisfies NextAuthOptions

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, config)
}
