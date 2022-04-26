import { Conseiller } from '../interfaces/conseiller'
import { RequestError } from '../utils/fetchJson'

import ErrorCodes from './error-codes'

import { ApiClient } from 'clients/api.client'
import { DossierMilo } from 'interfaces/jeune'

export interface ConseillerService {
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

  getConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Conseiller | undefined>
}

export class ConseillerApiService implements ConseillerService {
  constructor(private readonly apiClient: ApiClient) {}

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

  async getConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Conseiller | undefined> {
    try {
      return await this.apiClient.get<Conseiller>(
        `/conseillers/${idConseiller}`,
        accessToken
      )
    } catch (e) {
      if (e instanceof RequestError && e.code === ErrorCodes.NON_TROUVE) {
        return undefined
      }
      throw e
    }
  }
}
