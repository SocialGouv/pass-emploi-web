import { decode, JwtPayload } from 'jsonwebtoken'
import { Account } from 'next-auth'
import { HydratedJWT, JWT } from 'next-auth/jwt'

import { UserRole, UserType } from 'interfaces/conseiller'
import HttpClient from 'utils/httpClient'

function secondsToTimestamp(seconds: number): number {
  return seconds * 1000
}

interface RefreshedTokens {
  access_token: string | undefined
  refresh_token: string | undefined
  expires_in: number | undefined
}

export const RefreshAccessTokenError = 'RefreshAccessTokenError'

export default class Authenticator {
  private readonly issuerPrefix?: string

  constructor(private readonly httpClient: HttpClient) {
    this.issuerPrefix = process.env.KEYCLOAK_ISSUER
  }

  async handleJWTAndRefresh({
    jwt,
    account,
  }: {
    jwt: JWT | HydratedJWT
    account?: Account
  }): Promise<HydratedJWT> {
    if (account) return Authenticator.hydrateJwtAtFirstSignin(account, jwt)

    const hydratedJWT = jwt as HydratedJWT
    const safetyRefreshBuffer15Seconds: number = 15000
    const tokenIsExpired = hydratedJWT.expiresAtTimestamp
      ? Date.now() >
        hydratedJWT.expiresAtTimestamp - safetyRefreshBuffer15Seconds
      : false

    if (tokenIsExpired) {
      return this.refreshAccessToken(hydratedJWT)
    }
    return hydratedJWT
  }

  private async refreshAccessToken(jwt: HydratedJWT) {
    try {
      const refreshedTokens = await this.fetchRefreshedTokens(jwt.refreshToken)

      return {
        ...jwt,
        accessToken: refreshedTokens.access_token,
        refreshToken: refreshedTokens.refresh_token ?? jwt.refreshToken, // Garde l'ancien refresh_token
        expiresAtTimestamp: refreshedTokens.expires_in
          ? Date.now() + refreshedTokens.expires_in * 1000
          : jwt.expiresAtTimestamp,
      }
    } catch (error) {
      return {
        ...jwt,
        error: RefreshAccessTokenError,
      }
    }
  }

  private async fetchRefreshedTokens(
    refreshToken?: string
  ): Promise<RefreshedTokens> {
    const url = `${this.issuerPrefix}/protocol/openid-connect/token`
    const body = new URLSearchParams({
      client_id: process.env.KEYCLOAK_ID ?? '',
      client_secret: process.env.KEYCLOAK_SECRET ?? '',
      grant_type: 'refresh_token',
      refresh_token: `${refreshToken}`,
    })

    const { content: tokens } = await this.httpClient.fetchJson(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body,
    })
    return tokens
  }

  private static async hydrateJwtAtFirstSignin(
    { access_token, expires_at, refresh_token }: Account,
    jwt: JWT
  ): Promise<HydratedJWT> {
    const { userId, userStructure, userRoles, userType } = decode(
      <string>access_token
    ) as JwtPayload

    return {
      ...jwt,
      accessToken: access_token,
      refreshToken: refresh_token,
      idConseiller: userId,
      structureConseiller: userStructure,
      estConseiller: userType === UserType.CONSEILLER,
      estSuperviseur: Boolean(userRoles?.includes(UserRole.SUPERVISEUR)),
      expiresAtTimestamp: expires_at
        ? secondsToTimestamp(expires_at)
        : undefined,
    }
  }
}
