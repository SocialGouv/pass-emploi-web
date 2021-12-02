import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'
import KeycloakProvider from 'next-auth/providers/keycloak'
import fetchJson from '../../../utils/fetchJson'

async function refreshAccessToken(token: JWT) {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`
    const body = new URLSearchParams({
      client_id: process.env.KEYCLOAK_ID ?? '',
      client_secret: process.env.KEYCLOAK_SECRET ?? '',
      grant_type: 'refresh_token',
      refresh_token: `${token.refreshToken}`,
    })

    const refreshedTokens = await fetchJson(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body,
    })

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Garde l'ancien refresh_token
    }
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

export default NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || '',
      clientSecret: process.env.KEYCLOAK_SECRET || '',
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  jwt: { secret: process.env.AUTH_SECRET },

  callbacks: {
    async jwt({ token, account, user }) {
      const isFirstSignin = Boolean(account && user)
      if (isFirstSignin) {
        token.accessToken = account!.access_token
        token.refreshToken = account!.refresh_token
        return token
      }

      const tokenIsExpired = token.exp
        ? Date.now() > (token.exp as number) * 1000
        : false

      if (tokenIsExpired) {
        return refreshAccessToken(token)
      }
      return token
    },

    async session({ session }) {
      session.user.id = '1'
      return session
    },
  },
})
