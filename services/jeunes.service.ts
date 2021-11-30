import { Jeune } from 'interfaces'
import fetchJson from 'utils/fetchJson'

export class JeunesService {
  private readonly apiPrefix?: string

  constructor() {
    this.apiPrefix = process.env.API_ENDPOINT
  }

  getJeunesDuConseiller(idConseiller: string): Promise<Jeune[]> {
    return fetchJson(`${this.apiPrefix}/conseillers/${idConseiller}/jeunes`)
  }
}
