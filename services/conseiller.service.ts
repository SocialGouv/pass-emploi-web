import { ApiClient } from 'clients/api.client'
import { Conseiller } from 'interfaces/conseiller'
import { DossierMilo } from 'interfaces/jeune'
import { ConseillerJson, jsonToConseiller } from 'interfaces/json/conseiller'
import { RequestError } from 'utils/httpClient'

export interface ConseillerService {
  getConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Conseiller | undefined>

  modifierAgence(
    idConseiller: string,
    agence: { id?: string; nom: string },
    accessToken: string
  ): Promise<void>

  modifierNotificationsSonores(
    idConseiller: string,
    hasNotificationsSonores: boolean,
    accessToken: string
  ): Promise<void>

  getDossierJeune(
    idDossier: string,
    accessToken: string
  ): Promise<DossierMilo | undefined>

  createCompteJeuneMilo(
    newJeune: {
      idDossier: string
      nom: string
      prenom: string
      email: string | undefined
      idConseiller: string
    },
    accessToken: string
  ): Promise<{ id: string }>
}

export class ConseillerApiService implements ConseillerService {
  constructor(private readonly apiClient: ApiClient) {}

  async getConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Conseiller | undefined> {
    try {
      const conseillerJson = await this.apiClient.get<ConseillerJson>(
        `/conseillers/${idConseiller}`,
        accessToken
      )

      return jsonToConseiller(conseillerJson)
    } catch (e) {
      if (e instanceof RequestError) {
        return undefined
      }
      throw e
    }
  }

  modifierAgence(
    idConseiller: string,
    { id, nom }: { id?: string; nom: string },
    accessToken: string
  ): Promise<void> {
    const agence = id ? { id } : { nom }
    return this.apiClient.put(
      `/conseillers/${idConseiller}`,
      { agence },
      accessToken
    )
  }

  modifierNotificationsSonores(
    idConseiller: string,
    hasNotificationsSonores: boolean,
    accessToken: string
  ): Promise<void> {
    return this.apiClient.put(
      `/conseillers/${idConseiller}`,
      { notificationsSonores: hasNotificationsSonores },
      accessToken
    )
  }

  getDossierJeune(
    idDossier: string,
    accessToken: string
  ): Promise<DossierMilo | undefined> {
    return this.apiClient.get<DossierMilo | undefined>(
      `/conseillers/milo/dossiers/${idDossier}`,
      accessToken
    )
  }

  createCompteJeuneMilo(
    newJeune: {
      idDossier: string
      nom: string
      prenom: string
      email: string | undefined
      idConseiller: string
    },
    accessToken: string
  ): Promise<{ id: string }> {
    return this.apiClient.post<{ id: string }>(
      `/conseillers/milo/jeunes`,
      newJeune,
      accessToken
    )
  }
}
