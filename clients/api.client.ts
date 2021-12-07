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

    return fetchJson(`${this.apiPrefix}${path}`, { headers })
  }

  async post<T>(
    path: string,
    payload: { [key: string]: any },
    accessToken: string
  ): Promise<T> {
    const headers = new Headers({
      authorization: `bearer ${accessToken}`,
      'content-type': 'application/json',
    })

    return fetchJson(`${this.apiPrefix}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
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
