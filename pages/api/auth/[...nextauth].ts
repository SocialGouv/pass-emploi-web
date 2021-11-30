import { JWT } from 'jose'
import NextAuth from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    KeycloakProvider({
      clientId: "pass-emploi-web",
      clientSecret: "b208225f-addd-4600-8ae5-de6e19234551",
      issuer: "http://localhost:8082/auth/realms/pass-emploi",
    })
  ],
  callbacks: {
    async session({ session, user, token }) {
      console.log(token.accessToken)
      // @ts-ignore
      const accessToken = JWT.decode(token.accessToken)
      // console.log(token.accessToken)
      // console.log(accessToken)
      session.user={
        ...session.user,
        // @ts-ignore
        type: accessToken.type,
        // @ts-ignore
        id: accessToken.id,
        // @ts-ignore
        from: accessToken.from,
      }
      return session
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    redirect({ url, baseUrl   }) {
      if (url.startsWith(baseUrl) && !url.endsWith("/login")) return url
      // Allows relative callback URLs
      else if (url.startsWith("/")) return new URL(url, baseUrl).toString()
      return baseUrl
    }
  }
})
