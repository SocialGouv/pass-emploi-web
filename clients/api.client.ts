import fetchJson from '../utils/fetchJson'

export class ApiClient {
  private readonly apiPrefix?: string

  constructor() {
    this.apiPrefix = process.env.API_ENDPOINT
  }

  async get(path: string, accessToken: string): Promise<any> {
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
    })

    return fetchJson(`${this.apiPrefix}${path}`, { headers })
  }

  async post(
    path: string,
    payload: { [key: string]: any } | undefined,
    accessToken: string
  ): Promise<any> {
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    })

    const reqInit: RequestInit = {
      method: 'POST',
      headers,
    }
    if (payload) reqInit.body = JSON.stringify(payload)

    return fetchJson(`${this.apiPrefix}${path}`, reqInit)
  }

  async put(
    path: string,
    payload: { [key: string]: any },
    accessToken: string
  ): Promise<Response> {
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    })

    return fetch(`${this.apiPrefix}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    })
  }

  async delete(path: string, accessToken: string): Promise<Response> {
    const headers = new Headers({
      Authorization: `bearer ${accessToken}`,
    })

    return fetch(`${this.apiPrefix}${path}`, {
      method: 'DELETE',
      headers,
    })
  }
}
