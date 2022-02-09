import { ApiClient } from 'clients/api.client'
import { Jeune } from 'interfaces/jeune'
import { Conseiller } from '../interfaces/conseiller'

export interface JeunesService {
  getJeunesDuConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Jeune[]>

  getJeunesDuConseillerParEmail(
    emailConseiller: string,
    accessToken: string
  ): Promise<{ idConseiller: string; jeunes: Jeune[] }>

  getJeuneDetails(idJeune: string, accessToken: string): Promise<Jeune>

  createCompteJeunePoleEmploi(
    newJeune: { firstName: string; lastName: string; email: string },
    idConseiller: string,
    accessToken: string
  ): Promise<Jeune>

  reaffecter(
    idConseillerInitial: string,
    emailConseillerDestination: string,
    idsJeunes: string[],
    accessToken: string
  ): Promise<void>
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
    return this.apiClient.post(
      `/conseillers/pole-emploi/jeunes`,
      { ...newJeune, idConseiller: idConseiller },
      accessToken
    )
  }

  async getJeunesDuConseillerParEmail(
    emailConseiller: string,
    accessToken: string
  ): Promise<{ idConseiller: string; jeunes: Jeune[] }> {
    const conseiller: Conseiller = await this.apiClient.get(
      `/conseillers?email=${emailConseiller}`,
      accessToken
    )
    const jeunesDuConseiller = await this.getJeunesDuConseiller(
      conseiller.id,
      accessToken
    )
    return { idConseiller: conseiller.id, jeunes: jeunesDuConseiller }
  }

  async reaffecter(
    idConseillerInitial: string,
    emailConseillerDestination: string,
    idsJeunes: string[],
    accessToken: string
  ): Promise<void> {
    const conseillerDestination: Conseiller = await this.apiClient.get(
      `/conseillers?email=${emailConseillerDestination}`,
      accessToken
    )

    return this.apiClient.post(
      '/jeunes/transferer',
      {
        idConseillerSource: idConseillerInitial,
        idConseillerCible: conseillerDestination.id,
        idsJeune: idsJeunes,
      },
      accessToken
    )
  }
}
