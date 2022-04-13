import NextAuth, { Account, Session } from 'next-auth'
import { HydratedJWT, JWT } from 'next-auth/jwt'
import KeycloakProvider from 'next-auth/providers/keycloak'
import authenticator from 'utils/auth/authenticator'

export default NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || '',
      clientSecret: process.env.KEYCLOAK_SECRET || '',
      issuer: process.env.KEYCLOAK_ISSUER || '',
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  jwt: {
    secret: process.env.AUTH_SECRET,
  },

  callbacks: {
    async jwt({ token: jwt, account }: { token: JWT; account?: Account }) {
      return authenticator.handleJWTAndRefresh({ jwt, account })
    },

    async session({
      session,
      token,
    }: {
      session: Session
      token: HydratedJWT
    }) {
      session.firebaseToken = token.firebaseToken ?? ''
      session.user.id = token.idConseiller ?? ''
      session.user.structure = token.structureConseiller ?? ''
      session.user.estConseiller = token.estConseiller ?? false
      session.user.estSuperviseur = token.estSuperviseur ?? false
      session.accessToken = token.accessToken ?? ''
      session.error = (token.error as string) ?? ''
      return session
    },
  },
})
