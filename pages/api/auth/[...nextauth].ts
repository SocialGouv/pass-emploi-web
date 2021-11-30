import NextAuth from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'
import jwt from 'next-auth/jwt'

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || '',
      clientSecret: process.env.KEYCLOAK_SECRET || '',
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],

  callbacks: {
    async session({ session, user, token }) {
      console.log(token.accessToken)
      // @ts-ignore
      console.log('lala', token)
      console.log('session', session)
      // console.log(token.accessToken)
      // console.log(accessToken)
      // session.user = {
      //   ...session.user,
      //   // @ts-ignore
      //   type: accessToken.type,
      //   // @ts-ignore
      //   id: accessToken.id,
      //   // @ts-ignore
      //   from: accessToken.from,
      // }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('url', url, 'baseUrl', baseUrl)
      return baseUrl
    },
  },
})
