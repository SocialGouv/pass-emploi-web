import { ApiClient } from 'clients/api.client'
import { signIn } from 'next-auth/react'
import fetchJson from 'utils/fetchJson'

interface RefreshedTokens {
  access_token: string | undefined
  refresh_token: string | undefined
  expires_in: number | undefined
}

export interface AuthService {
  signIn(redirectUrl?: string, idProvider?: string): Promise<void>

  fetchRefreshedTokens(refreshToken?: string): Promise<RefreshedTokens>
  getFirebaseToken(accesssToken: string): Promise<{ token: string }>
}

export class NextAuthService implements AuthService {
  private readonly issuerPrefix?: string

  constructor(private readonly apiClient: ApiClient) {
    this.issuerPrefix = process.env.KEYCLOAK_ISSUER
  }

  async signIn(
    redirectUrl: string = '/',
    idProvider: string = ''
  ): Promise<void> {
    try {
      await signIn(
        'keycloak',
        { callbackUrl: redirectUrl },
        { kc_idp_hint: idProvider }
      )
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  fetchRefreshedTokens(refreshToken?: string): Promise<RefreshedTokens> {
    const url = `${this.issuerPrefix}/protocol/openid-connect/token`
    const body = new URLSearchParams({
      client_id: process.env.KEYCLOAK_ID ?? '',
      client_secret: process.env.KEYCLOAK_SECRET ?? '',
      grant_type: 'refresh_token',
      refresh_token: `${refreshToken}`,
    })

    return fetchJson(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body,
    })
  }

  //TODO: remplacer le POST par un GET ?
  async getFirebaseToken(accessToken: string): Promise<{ token: string }> {
    return this.apiClient!.post<{ token: string }>(
      '/auth/firebase/token',
      {},
      accessToken
    )
  }
}
