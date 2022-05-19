import ErrorCodes from './error-codes'

import { ApiClient } from 'clients/api.client'
import { Conseiller } from 'interfaces/conseiller'
import { ConseillerHistorique, Jeune } from 'interfaces/jeune'
import {
  ConseillerHistoriqueJson,
  toConseillerHistorique,
} from 'interfaces/json/conseiller'
import {
  JeuneDuConseillerJson,
  toJeuneDuConseiller,
} from 'interfaces/json/jeune'
import { RequestError } from 'utils/httpClient'

export interface JeunesService {
  getJeunesDuConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Jeune[]>

  getConseillersDuJeune(
    idConseiller: string,
    accessToken: string
  ): Promise<ConseillerHistorique[]>

  getJeunesDuConseillerParEmail(
    emailConseiller: string,
    accessToken: string
  ): Promise<{ idConseiller: string; jeunes: Jeune[] }>

  getJeuneDetails(
    idJeune: string,
    accessToken: string
  ): Promise<Jeune | undefined>

  getIdJeuneMilo(
    numeroDossier: string,
    accessToken: string
  ): Promise<string | undefined>

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

  supprimerJeune(idJeune: string, accessToken: string): Promise<void>
}

export class JeunesApiService implements JeunesService {
  constructor(private readonly apiClient: ApiClient) {}

  async getJeunesDuConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Jeune[]> {
    const jeunes = await this.apiClient.get<JeuneDuConseillerJson[]>(
      `/conseillers/${idConseiller}/jeunes`,
      accessToken
    )
    return jeunes.map(toJeuneDuConseiller)
  }

  async getJeuneDetails(
    idJeune: string,
    accessToken: string
  ): Promise<Jeune | undefined> {
    try {
      return await this.apiClient.get<Jeune>(`/jeunes/${idJeune}`, accessToken)
    } catch (e) {
      if (e instanceof RequestError && e.code === ErrorCodes.NON_TROUVE) {
        return undefined
      }
      throw e
    }
  }

  async getConseillersDuJeune(
    idJeune: string,
    accessToken: string
  ): Promise<ConseillerHistorique[]> {
    {
      try {
        const historique = await this.apiClient.get<ConseillerHistoriqueJson[]>(
          `/jeunes/${idJeune}/conseillers`,
          accessToken
        )
        return historique.map(toConseillerHistorique)
      } catch (e) {
        if (e instanceof RequestError && e.code === ErrorCodes.NON_TROUVE) {
          return []
        }
        throw e
      }
    }
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

  async getJeunesDuConseillerParEmail(
    emailConseiller: string,
    accessToken: string
  ): Promise<{ idConseiller: string; jeunes: Jeune[] }> {
    const conseiller = await this.apiClient.get<Conseiller>(
      `/conseillers?email=${emailConseiller}`,
      accessToken
    )
    const jeunesDuConseiller = await this.getJeunesDuConseiller(
      conseiller.id,
      accessToken
    )
    return { idConseiller: conseiller.id, jeunes: jeunesDuConseiller }
  }

  async getIdJeuneMilo(
    numeroDossier: string,
    accessToken: string
  ): Promise<string | undefined> {
    try {
      const { id } = await this.apiClient.get<Jeune>(
        `/conseillers/milo/jeunes/${numeroDossier}`,
        accessToken
      )
      return id
    } catch (e) {
      if (e instanceof RequestError && e.code === ErrorCodes.NON_TROUVE) {
        return undefined
      }
      throw e
    }
  }

  async reaffecter(
    idConseillerInitial: string,
    emailConseillerDestination: string,
    idsJeunes: string[],
    accessToken: string
  ): Promise<void> {
    const conseillerDestination = await this.apiClient.get<Conseiller>(
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

  async supprimerJeune(idJeune: string, accessToken: string): Promise<void> {
    await this.apiClient.delete(`/jeunes/${idJeune}`, accessToken)
  }
}
