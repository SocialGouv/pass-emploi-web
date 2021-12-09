import NextAuth from 'next-auth'
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
    async jwt({ token: jwt, account }) {
      return authenticator.handleJWTAndRefresh({ jwt, account })
    },

    async session({ session, token }) {
      session.user.id = token.idConseiller ?? ''
      session.accessToken = token.accessToken ?? ''
      return session
    },
  },
})
