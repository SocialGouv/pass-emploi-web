import { decode, JwtPayload } from 'jsonwebtoken'
import { Account } from 'next-auth'
import { HydratedJWT, JWT } from 'next-auth/jwt'

import { AuthService } from 'services/auth.service'

function secondsToTimestamp(seconds: number): number {
  return seconds * 1000
}

export class Authenticator {
  constructor(private readonly authService: AuthService) {}

  async handleJWTAndRefresh({
    jwt,
    account,
  }: {
    jwt: JWT | HydratedJWT
    account?: Account
  }): Promise<HydratedJWT> {
    if (account) return hydrateJwtAtFirstSignin(account, jwt)

    const hydratedJWT = jwt as HydratedJWT
    const safetyRefreshBuffer: number = 15
    const tokenIsExpired = hydratedJWT.expiresAtTimestamp
      ? Date.now() > hydratedJWT.expiresAtTimestamp - safetyRefreshBuffer * 1000
      : false

    if (tokenIsExpired) {
      return this.refreshAccessToken(hydratedJWT)
    }
    return hydratedJWT
  }

  private async refreshAccessToken(jwt: HydratedJWT) {
    try {
      const refreshedTokens = await this.authService.fetchRefreshedTokens(
        jwt.refreshToken
      )

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
        error: 'RefreshAccessTokenError',
      }
    }
  }
}

async function hydrateJwtAtFirstSignin(
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
    estConseiller: userType === 'CONSEILLER',
    estSuperviseur: Boolean(userRoles?.includes('SUPERVISEUR')),
    expiresAtTimestamp: expires_at ? secondsToTimestamp(expires_at) : undefined,
  }
}

const authenticator = new Authenticator(new AuthService())
export default authenticator
