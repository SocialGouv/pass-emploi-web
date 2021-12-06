import { Account, User } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { AuthService } from 'services/auth.service'
import fetchJson from 'utils/fetchJson'

function secondsToTimestamp(seconds: number): number {
  return seconds * 1000
}
export class Authenticator {
  constructor(private readonly authService: AuthService) {}

  handleJWTAndRefresh({ jwt, account }: { jwt: JWT; account?: Account }) {
    const isFirstSignin = Boolean(account)
    if (isFirstSignin) {
      jwt.accessToken = account!.access_token as string
      jwt.refreshToken = account!.refresh_token as string
      jwt.expiresAtTimestamp = account!.expires_at
        ? secondsToTimestamp(account!.expires_at)
        : undefined
      console.log('account expires at', account!.expires_at)
      return jwt
    }

    const safetyRefreshBuffer: number = 15
    const tokenIsExpired = jwt.expiresAtTimestamp
      ? Date.now() > jwt.expiresAtTimestamp - safetyRefreshBuffer
      : false
    console.log('tokenIsExpired', tokenIsExpired)

    if (tokenIsExpired) {
      return this.refreshAccessToken(jwt)
    }
    return jwt
  }

  private async refreshAccessToken(jwt: JWT) {
    try {
      const refreshedTokens = await this.authService.updateToken(
        jwt.refreshToken
      )

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
}

const authenticator = new Authenticator(new AuthService())
export default authenticator
