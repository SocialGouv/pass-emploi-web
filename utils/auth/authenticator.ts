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
    const isFirstSignin = Boolean(account)
    if (isFirstSignin) {
      const { userId, userStructure, userRoles } = decode(
        <string>account!.access_token
      ) as JwtPayload
      jwt.accessToken = account!.access_token
      jwt.refreshToken = account!.refresh_token
      jwt.idConseiller = userId
      jwt.structureConseiller = userStructure
      jwt.estSuperviseur = Boolean(userRoles?.includes('SUPERVISEUR'))
      jwt.expiresAtTimestamp = account!.expires_at
        ? secondsToTimestamp(account!.expires_at)
        : undefined
      jwt.firebaseToken = await this.handleFirebaseToken(
        account!.access_token as string
      )
      return jwt
    }

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

  private async handleFirebaseToken(accessToken: string) {
    const { token } = await this.authService.getFirebaseToken(accessToken)
    return token
  }
}

const authenticator = new Authenticator(new AuthService())
export default authenticator
