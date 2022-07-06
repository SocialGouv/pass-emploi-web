import { ApiClient } from 'clients/api.client'
import { Conseiller } from 'interfaces/conseiller'
import {
  ConseillerHistorique,
  DetailJeune,
  JeuneFromListe,
  MotifsSuppression,
} from 'interfaces/jeune'
import {
  ConseillerHistoriqueJson,
  toConseillerHistorique,
} from 'interfaces/json/conseiller'
import {
  DetailJeuneJson,
  ItemJeuneJson,
  jsonToDetailJeune,
  jsonToItemJeune,
  SuppressionJeuneFormData,
} from 'interfaces/json/jeune'
import { ApiError } from 'utils/httpClient'

export interface JeunesService {
  getJeunesDuConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<JeuneFromListe[]>

  getConseillersDuJeune(
    idConseiller: string,
    accessToken: string
  ): Promise<ConseillerHistorique[]>

  getJeunesDuConseillerParEmail(
    emailConseiller: string,
    accessToken: string
  ): Promise<{ idConseiller: string; jeunes: JeuneFromListe[] }>

  getJeuneDetails(
    idJeune: string,
    accessToken: string
  ): Promise<DetailJeune | undefined>

  getIdJeuneMilo(
    numeroDossier: string,
    accessToken: string
  ): Promise<string | undefined>

  createCompteJeunePoleEmploi(
    newJeune: { firstName: string; lastName: string; email: string },
    idConseiller: string,
    accessToken: string
  ): Promise<{ id: string }>

  reaffecter(
    idConseillerInitial: string,
    emailConseillerDestination: string,
    idsJeunes: string[],
    estTemporaire: boolean,
    accessToken: string
  ): Promise<void>

  supprimerJeuneInactif(idJeune: string, accessToken: string): Promise<void>

  archiverJeune(
    idJeune: string,
    payload: SuppressionJeuneFormData,
    accessToken: string
  ): Promise<void>

  getMotifsSuppression(accessToken: string): Promise<MotifsSuppression[]>
}

export class JeunesApiService implements JeunesService {
  constructor(private readonly apiClient: ApiClient) {}

  async getJeunesDuConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<JeuneFromListe[]> {
    const { content: jeunes } = await this.apiClient.get<ItemJeuneJson[]>(
      `/conseillers/${idConseiller}/jeunes`,
      accessToken
    )
    return jeunes.map(jsonToItemJeune)
  }

  async getJeuneDetails(
    idJeune: string,
    accessToken: string
  ): Promise<DetailJeune | undefined> {
    try {
      const { content: jeune } = await this.apiClient.get<DetailJeuneJson>(
        `/jeunes/${idJeune}`,
        accessToken
      )
      return jsonToDetailJeune(jeune)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
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
        const { content: historique } = await this.apiClient.get<
          ConseillerHistoriqueJson[]
        >(`/jeunes/${idJeune}/conseillers`, accessToken)
        return historique.map(toConseillerHistorique)
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
          return []
        }
        throw e
      }
    }
  }

  async createCompteJeunePoleEmploi(
    newJeune: { firstName: string; lastName: string; email: string },
    idConseiller: string,
    accessToken: string
  ): Promise<{ id: string }> {
    const {
      content: { id },
    } = await this.apiClient.post<{ id: string }>(
      `/conseillers/pole-emploi/jeunes`,
      { ...newJeune, idConseiller: idConseiller },
      accessToken
    )
    return { id }
  }

  async getJeunesDuConseillerParEmail(
    emailConseiller: string,
    accessToken: string
  ): Promise<{ idConseiller: string; jeunes: JeuneFromListe[] }> {
    const { content: conseiller } = await this.apiClient.get<Conseiller>(
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
      const {
        content: { id },
      } = await this.apiClient.get<{ id: string }>(
        `/conseillers/milo/jeunes/${numeroDossier}`,
        accessToken
      )
      return id
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }
      throw e
    }
  }

  async reaffecter(
    idConseillerInitial: string,
    emailConseillerDestination: string,
    idsJeunes: string[],
    estTemporaire: boolean,
    accessToken: string
  ): Promise<void> {
    const { content: conseillerDestination } =
      await this.apiClient.get<Conseiller>(
        `/conseillers?email=${emailConseillerDestination}`,
        accessToken
      )
    await this.apiClient.post(
      '/jeunes/transferer',
      {
        idConseillerSource: idConseillerInitial,
        idConseillerCible: conseillerDestination.id,
        idsJeune: idsJeunes,
        estTemporaire: estTemporaire,
      },
      accessToken
    )
  }

  async supprimerJeuneInactif(
    idJeune: string,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.delete(`/jeunes/${idJeune}`, accessToken)
  }

  async archiverJeune(
    idJeune: string,
    payload: SuppressionJeuneFormData,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.post(
      `/jeunes/${idJeune}/archiver`,
      payload,
      accessToken
    )
  }

  async getMotifsSuppression(
    accessToken: string
  ): Promise<MotifsSuppression[]> {
    const { content: motifs } = await this.apiClient.get<MotifsSuppression[]>(
      '/referentiels/motifs-suppression-jeune',
      accessToken
    )
    return motifs
  }
}
