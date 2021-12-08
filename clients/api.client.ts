import fetchJson from '../utils/fetchJson'

export class ApiClient {
  private readonly apiPrefix?: string

  constructor() {
    this.apiPrefix = process.env.API_ENDPOINT
  }

  async get<T>(path: string, accessToken: string): Promise<T> {
    const headers = new Headers({
      authorization: `bearer ${accessToken}`,
    })

    return fetchJson<T>(`${this.apiPrefix}${path}`, { headers })
  }

  async post<T = void>(
    path: string,
    payload: { [key: string]: any } | undefined,
    accessToken: string
  ): Promise<T> {
    const headers = new Headers({
      authorization: `bearer ${accessToken}`,
      'content-type': 'application/json',
    })

    const reqInit: RequestInit = {
      method: 'POST',
      headers,
    }
    if (payload) reqInit.body = JSON.stringify(payload)

    return fetchJson<T>(`${this.apiPrefix}${path}`, reqInit)
  }

  async put(
    path: string,
    payload: { [key: string]: any },
    accessToken: string
  ): Promise<Response> {
    const headers = new Headers({
      authorization: `bearer ${accessToken}`,
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
      authorization: `bearer ${accessToken}`,
    })

    return fetch(`${this.apiPrefix}${path}`, {
      method: 'DELETE',
      headers,
    })
  }
}
