import fetchJson from '../utils/fetchJson'

export class ApiClient {
  private readonly apiPrefix?: string

  constructor() {
    this.apiPrefix = process.env.API_ENDPOINT
  }

  async get<T>(path: string, accessToken: string): Promise<T> {
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
    })

    const json = await fetchJson(`${this.apiPrefix}${path}`, { headers })
    return json as T
  }

  async post<T = void>(
    path: string,
    payload: { [key: string]: any } | undefined,
    accessToken: string
  ): Promise<T> {
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    })

    const reqInit: RequestInit = {
      method: 'POST',
      headers,
    }
    if (payload) reqInit.body = JSON.stringify(payload)

    const json = await fetchJson(`${this.apiPrefix}${path}`, reqInit)
    return json as T
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
