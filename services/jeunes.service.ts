import { ApiClient } from 'clients/api.client'
import { Jeune } from 'interfaces'

export class JeunesService {
  constructor(private readonly apiClient: ApiClient) {}

  getJeunesDuConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Jeune[]> {
    return this.apiClient.get(
      `/conseillers/${idConseiller}/jeunes`,
      accessToken
    )
  }
}
