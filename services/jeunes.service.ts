import { ApiClient } from 'clients/api.client'
import { Jeune } from 'interfaces/jeune'

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

  getJeuneDetails(idJeune: string, accessToken: string): Promise<Jeune> {
    return this.apiClient.get(`/jeunes/${idJeune}`, accessToken)
  }

  createJeuneDuConseiller(
    newJeune: { firstName: string; lastName: string },
    idConseiller: string,
    accessToken: string
  ): Promise<Jeune> {
    return this.apiClient.post<Jeune>(
      `/conseillers/${idConseiller}/jeune`,
      newJeune,
      accessToken
    )
  }
}
