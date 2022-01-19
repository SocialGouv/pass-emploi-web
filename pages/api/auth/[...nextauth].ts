import NextAuth from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'
import { Container } from 'utils/injectionDependances'

const { authenticator } = Container.getDIContainer().dependances

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
    async jwt({ token: jwt, account }) {
      return authenticator.handleJWTAndRefresh({ jwt, account })
    },

    async session({ session, token }) {
      if (token.accessToken && !session.firebaseToken) {
        session.firebaseToken = await authenticator.getFirebaseToken(
          token.accessToken as string
        )
      }

      session.user.id = token.idConseiller ?? ''
      session.user.structure = token.structureConseiller ?? ''
      session.accessToken = token.accessToken ?? ''
      session.error = (token.error as string) ?? ''
      return session
    },
  },
})
