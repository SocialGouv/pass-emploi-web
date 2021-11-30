import { Conseiller } from 'interfaces'
import fetchJson from 'utils/fetchJson'

export class ConseillerService {
  async getConseillerConnecte(): Promise<Conseiller | undefined> {
    return fetchJson('/api/user')
  }
}
