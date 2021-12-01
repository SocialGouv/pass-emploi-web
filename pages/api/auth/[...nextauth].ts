import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'
import KeycloakProvider from 'next-auth/providers/keycloak'

async function refreshAccessToken(token: JWT) {
  try {
    console.log('>>>>>>>>>>> REFRESH')
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
    console.log('>>>>>>>>>>>')

    if (!response.ok) {
      throw refreshedTokens
    }

    console.log('>>>>>>>>>>>', { refreshedTokens })

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

    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      console.log('--------------jwt--------------')
      console.log('token', token)
      console.log('account', account)

      // Initial sign in
      if (account) {
        token.accessToken =
          'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnMG4zdi1lV2pLZVdjSXdSTlljQ2dSaHJTVkdBSXdpLWYxRnlOOVk1R1ZZIn0.eyJleHAiOjE2MzgzNTg2NzgsImlhdCI6MTYzODM1ODM3OCwiYXV0aF90aW1lIjoxNjM4MzU3OTc0LCJqdGkiOiJkYjY1Yzc1Zi0xMjMzLTRjYmEtOGZmMC0xMmQyMWY4YmU5ZWEiLCJpc3MiOiJodHRwczovL3BhLWF1dGgtc3RhZ2luZy5vc2Mtc2VjbnVtLWZyMS5zY2FsaW5nby5pby9hdXRoL3JlYWxtcy9wYXNzLWVtcGxvaSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI0NDgwOTJkYS00YWQ3LTRmY2YtOGZmNS1hMzAzZjMwZWExMDkiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJwYXNzLWVtcGxvaS13ZWIiLCJzZXNzaW9uX3N0YXRlIjoiMzgxZmEyZmMtNjUxMC00MjE1LWI1MDMtZTZjNjg0NmUzMWM0IiwiYWNyIjoiMCIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLXBhc3MtZW1wbG9pIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJzaWQiOiIzODFmYTJmYy02NTEwLTQyMTUtYjUwMy1lNmM2ODQ2ZTMxYzQiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJ0b3RvIHRhdGEiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ0b3RvIiwiZ2l2ZW5fbmFtZSI6InRvdG8iLCJmYW1pbHlfbmFtZSI6InRhdGEifQ.TQyLtGBUL_DqDCAseKfxvz2MUaTRqmGfnE7RMVg7fQ-5OommWqR4rZz51kRtTOuGNFKR0D6WVC3CR_iShgPyrj6lWswGsnQR1U_zZDEFcyi-011jkF310_j8KylUspWxY2p2HO0DF3k8gYonnS79sCnxUw8G9p-u_1X8ciBH3D5OUBJ2EFkN6iaICuNZtoV1Q34dK85V0HrvaR5-styCfDFDTColTfb6xolZc-UMqr_SqP0eIlRXzlVhZJITL_sc1QWQyfVRV5SJdRHYWMVfvu58q2a2ldLxAUWPNZ2gFtXcs4ZoZw9dCWfQMYTujdo2zItS3iuRg1WYEfMNooIfAg'
        token.refreshToken = account.refresh_token
        return token
      }

      // Token Expired
      console.log({ token })
      console.log('>>>>>>>', token.exp)
      const tokenIsExpired = token.exp
        ? Date.now() > (token.exp as number) * 1000
        : false
      console.log('>>>>>>>', tokenIsExpired)

      if (tokenIsExpired) {
        return refreshAccessToken(token)
      }
      return token
    },

    async session({ session, user, token }) {
      // @ts-ignore
      console.log('--------------session--------------')
      console.log('token', token)
      console.log('session', session)
      console.log('user', user)

      return session
    },
  },
})
