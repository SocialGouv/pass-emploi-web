import { decode, JwtPayload } from 'jsonwebtoken'
import { Account } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { AuthService } from 'services/auth.service'

export class Authenticator {
  constructor(private readonly authService: AuthService) {}

  handleJWTAndRefresh({ jwt, account }: { jwt: JWT; account?: Account }) {
    const isFirstSignin = Boolean(account)
    if (isFirstSignin) {
      const { userId, userStructure } = decode(
        <string>account!.access_token
      ) as JwtPayload
      jwt.accessToken = account!.access_token
      jwt.refreshToken = account!.refresh_token
      jwt.idConseiller = userId
      jwt.structureConseiller = userStructure
      jwt.expiresAtTimestamp = account!.expires_at
        ? secondsToTimestamp(account!.expires_at)
        : undefined
      return jwt
    }

    const safetyRefreshBuffer: number = 15
    const tokenIsExpired = jwt.expiresAtTimestamp
      ? Date.now() > jwt.expiresAtTimestamp - safetyRefreshBuffer * 1000
      : false

    if (tokenIsExpired) {
      return this.refreshAccessToken(jwt)
    }
    return jwt
  }

  private async refreshAccessToken(jwt: JWT) {
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

  async getFirebaseToken(accessToken: string) {
    const { token } = await this.authService.getFirebaseToken(accessToken)
    return token
  }
}

function secondsToTimestamp(seconds: number): number {
  return seconds * 1000
}
