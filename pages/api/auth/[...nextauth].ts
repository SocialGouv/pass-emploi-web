import NextAuth from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'
import { JWT } from 'next-auth/jwt'
import { jsonEval } from '@firebase/util'

async function refreshAccessToken(token: JWT) {
  try {
    const url =
      'https://pa-auth-staging.osc-secnum-fr1.scalingo.io/auth/realms/pass-emploi/protocol/openid-connect/token'

    const body = {
      client_id: process.env.KEYCLOAK_ID,
      client_secret: process.env.KEYCLOAK_SECRET,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: JSON.stringify(body),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

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
    async signIn({ user, account, profile, email, credentials }) {
      console.log('--------------signin--------------')
      console.log('account', account)
      console.log('user', user)
      console.log('profile', profile)
      console.log('email', profile)
      console.log('credentials', credentials)
      const isAllowedToSignIn = true
      if (isAllowedToSignIn) {
        return true
      } else {
        // Return false to display a default error message
        return false
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },

    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      console.log('--------------jwt--------------')
      console.log('token', token)
      console.log('account', account)

      // Initial sign in
      if (account) {
        return token
      }

      // Token Expired
      const tokenIsExpired = token.exp
        ? Date.now() > (token.exp as number) * 1000
        : false

      if (tokenIsExpired) {
        return refreshAccessToken(token)
      }
      return token
    },

    async session({ session, user, token }) {
      console.log(token.accessToken)
      // @ts-ignore
      console.log('--------------session--------------')
      console.log('token', token)
      console.log('session', session)

      return session
    },
  },
})
