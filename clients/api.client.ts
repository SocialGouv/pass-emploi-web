import fetchJson from '../utils/fetchJson'

export class ApiClient {
  private readonly apiPrefix?: string

  constructor() {
    this.apiPrefix = process.env.API_ENDPOINT
  }

  async get(path: string) {
    const token = 'todo'

    const headers = new Headers({
      authorization: `bearer ${token}`,
    })

    return fetchJson(`${this.apiPrefix}${path}`, { headers })
  }
}
