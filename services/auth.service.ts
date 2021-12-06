import fetchJson from 'utils/fetchJson'

export class AuthService {
  private readonly issuerPrefix?: string

  constructor() {
    this.issuerPrefix = process.env.KEYCLOAK_ISSUER
  }

  updateToken(refreshToken?: string): Promise<any> {
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
}
