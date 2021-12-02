import fetchJson from '../utils/fetchJson'

export class ApiClient {
  private readonly apiPrefix?: string

  constructor() {
    this.apiPrefix = process.env.API_ENDPOINT
  }

  get(path: string) {
    const token = 'token' // TODO recuperer le token
    const headers = new Headers({
      authorization: `bearer ${token}`,
    })

    return fetchJson(`${this.apiPrefix}${path}`, { headers })
  }
}
