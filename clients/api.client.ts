import fetchJson from '../utils/fetchJson'

export class ApiClient {
  private readonly apiPrefix?: string

  constructor() {
    this.apiPrefix = process.env.API_ENDPOINT
  }

  async get(path: string, accessToken: string) {
    const headers = new Headers({
      authorization: `bearer ${accessToken}`,
    })

    return fetchJson(`${this.apiPrefix}${path}`, { headers })
  }
}
