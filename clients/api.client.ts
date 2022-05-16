import HttpClient from 'utils/httpClient'

export interface ApiClient {
  get<T>(path: string, accessToken: string): Promise<T>
  post<T>(
    path: string,
    payload: { [key: string]: any } | undefined,
    accessToken: string
  ): Promise<T>
  put(
    path: string,
    payload: { [key: string]: any },
    accessToken: string
  ): Promise<void>
  delete(path: string, accessToken: string): Promise<void>
}

export class ApiHttpClient implements ApiClient {
  private readonly apiPrefix?: string

  constructor(private readonly httpClient: HttpClient) {
    this.apiPrefix = process.env.API_ENDPOINT
  }

  async get<T>(path: string, accessToken: string): Promise<T> {
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
    })

    const json = await this.httpClient.fetchJson(`${this.apiPrefix}${path}`, {
      headers,
    })
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

    const json = await this.httpClient.fetchJson(
      `${this.apiPrefix}${path}`,
      reqInit
    )
    return json as T
  }

  async put(
    path: string,
    payload: { [key: string]: any },
    accessToken: string
  ): Promise<void> {
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    })

    return this.httpClient.fetchNoContent(`${this.apiPrefix}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    })
  }

  async delete(path: string, accessToken: string): Promise<void> {
    const headers = new Headers({
      Authorization: `bearer ${accessToken}`,
      'content-type': 'application/json',
    })

    await this.httpClient.fetchNoContent(`${this.apiPrefix}${path}`, {
      method: 'DELETE',
      headers,
    })
  }
}
