import { InfoFichier } from 'interfaces/fichier'
import HttpClient from 'utils/httpClient'

export interface ApiClient {
  get<T>(
    path: string,
    accessToken: string
  ): Promise<{ content: T; headers: Headers }>
  post<T>(
    path: string,
    payload: { [key: string]: any },
    accessToken: string
  ): Promise<{ content: T; headers: Headers }>
  postFile(
    path: string,
    payload: FormData,
    accessToken: string
  ): Promise<InfoFichier>
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

  async get<T>(
    path: string,
    accessToken: string
  ): Promise<{ content: T; headers: Headers }> {
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
    })

    return this.httpClient.fetchJson(`${this.apiPrefix}${path}`, {
      headers,
    })
  }

  async post<T = void>(
    path: string,
    payload: { [key: string]: any },
    accessToken: string
  ): Promise<{ content: T; headers: Headers }> {
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    })

    const reqInit: RequestInit = {
      method: 'POST',
      headers,
    }
    if (payload && Object.keys(payload).length !== 0)
      reqInit.body = JSON.stringify(payload)

    return this.httpClient.fetchJson(`${this.apiPrefix}${path}`, reqInit)
  }

  async postFile(
    path: string,
    payload: FormData,
    accessToken: string
  ): Promise<InfoFichier> {
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
    })

    const reqInit: RequestInit = {
      method: 'POST',
      headers,
    }
    if (payload) reqInit.body = payload

    const { content }: { content: InfoFichier } =
      await this.httpClient.fetchJson(`${this.apiPrefix}${path}`, reqInit)
    return content
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
