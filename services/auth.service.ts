import { ApiClient } from 'clients/api.client'
import fetchJson from 'utils/fetchJson'

export class AuthService {
  private readonly issuerPrefix?: string
  private readonly apiClient: ApiClient

  constructor() {
    this.issuerPrefix = process.env.KEYCLOAK_ISSUER
    this.apiClient = new ApiClient()
  }

  fetchRefreshedTokens(refreshToken?: string): Promise<{
    access_token: string | undefined
    refresh_token: string | undefined
    expires_in: number | undefined
  }> {
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
    return this.apiClient.post<{ token: string }>(
      '/auth/firebase/token',
      {},
      accessToken
    )
  }
}
