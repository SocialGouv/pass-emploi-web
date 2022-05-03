import { Conseiller } from '../interfaces/conseiller'
import { ConseillerJson } from '../interfaces/json/conseiller'
import { RequestError } from '../utils/fetchJson'

import { ApiClient } from 'clients/api.client'
import { DossierMilo } from 'interfaces/jeune'

export interface ConseillerService {
  getConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Conseiller | undefined>

  modifierAgence(
    idConseiller: string,
    idAgence: string,
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
      const { agence, ...conseiller } =
        await this.apiClient.get<ConseillerJson>(
          `/conseillers/${idConseiller}`,
          accessToken
        )

      return agence ? { ...conseiller, agence: agence.nom } : conseiller
    } catch (e) {
      if (e instanceof RequestError) {
        return undefined
      }
      throw e
    }
  }

  modifierAgence(
    idConseiller: string,
    idAgence: string,
    accessToken: string
  ): Promise<void> {
    return this.apiClient.put(
      `/conseillers/${idConseiller}`,
      { agence: { id: idAgence } },
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
