import { ApiClient } from 'clients/api.client'
import { Jeune } from 'interfaces/jeune'

export interface JeunesService {
  getJeunesDuConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Jeune[]>

  getJeuneDetails(idJeune: string, accessToken: string): Promise<Jeune>

  createCompteJeunePoleEmploi(
    newJeune: { firstName: string; lastName: string; email: string },
    idConseiller: string,
    accessToken: string
  ): Promise<Jeune>
}

export class JeunesApiService implements JeunesService {
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

  createCompteJeunePoleEmploi(
    newJeune: { firstName: string; lastName: string; email: string },
    idConseiller: string,
    accessToken: string
  ): Promise<Jeune> {
    return this.apiClient.post<Jeune>(
      `/conseillers/pole-emploi/jeunes`,
      { ...newJeune, idConseiller: idConseiller },
      accessToken
    )
  }
}
