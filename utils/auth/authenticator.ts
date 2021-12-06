import { Account } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import fetchJson from '../fetchJson'

function handleJWTAndRefresh({
  jwt,
  account,
}: {
  jwt: JWT
  account?: Account
}) {
  const isFirstSignin = Boolean(account)
  if (isFirstSignin) {
    jwt.accessToken = account!.access_token as string
    jwt.refreshToken = account!.refresh_token as string
    jwt.expiresAt = account!.expires_at
      ? new Date(secondsToTimestamp(account!.expires_at))
      : undefined
    return jwt
  }

  const safetyRefreshBuffer: number = 15
  const tokenIsExpired = jwt.expiresAt
    ? Date.now() > jwt.expiresAt.getTime() - safetyRefreshBuffer
    : false

  if (tokenIsExpired) {
    return refreshAccessToken(jwt)
  }
  return jwt
}

function secondsToTimestamp(seconds: number): number {
  return seconds * 1000
}

async function refreshAccessToken(jwt: JWT) {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`
    const body = new URLSearchParams({
      client_id: process.env.KEYCLOAK_ID ?? '',
      client_secret: process.env.KEYCLOAK_SECRET ?? '',
      grant_type: 'refresh_token',
      refresh_token: `${jwt.refreshToken}`,
    })

    const refreshedTokens = await fetchJson(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body,
    })

    return {
      ...jwt,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? jwt.refreshToken, // Garde l'ancien refresh_token
    }
  } catch (error) {
    return {
      ...jwt,
      error: 'RefreshAccessTokenError',
    }
  }
}

const Authenticator = { handleJWTAndRefresh }
export default Authenticator
