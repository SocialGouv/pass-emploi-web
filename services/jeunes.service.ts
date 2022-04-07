import { ApiClient } from 'clients/api.client'
import { ConseillerHistorique, Jeune } from 'interfaces/jeune'
import { Conseiller } from '../interfaces/conseiller'
import { RequestError } from '../utils/fetchJson'
import ErrorCodes from './error-codes'
import { conseillersPrecedents } from 'fixtures/jeune'

export interface JeunesService {
  getJeunesDuConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Jeune[]>

  getConseillersDuJeune(
    idConseiller: string,
    accessToken: string
  ): Promise<ConseillerHistorique[] | undefined>

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

  getJeunesDuConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Jeune[]> {
    return this.apiClient.get<Jeune[]>(
      `/conseillers/${idConseiller}/jeunes`,
      accessToken
    )
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

  //TODO: modifier quand API prête
  async getConseillersDuJeune(
    idJeune: string,
    accessToken: string
  ): Promise<ConseillerHistorique[] | undefined> {
    return conseillersPrecedents
    // {
    //   try {
    //     return await this.apiClient.get<HistoriqueConseiller[]>(
    //       `/jeunes/${idJeune}/conseillers`,
    //       accessToken
    //     )
    //   } catch (e) {
    //     if (e instanceof RequestError && e.code === ErrorCodes.NON_TROUVE) {
    //       return undefined
    //     }
    //     throw e
    //   }
    // }
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
