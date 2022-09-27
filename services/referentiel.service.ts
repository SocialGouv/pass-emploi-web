import { ApiClient } from 'clients/api.client'
import { Agence, Localite } from 'interfaces/referentiel'
import { getSession } from 'next-auth/react'

export interface ReferentielService {
  getAgences(structure: string, accessToken: string): Promise<Agence[]>
  getCommunesEtDepartements(query: string): Promise<Localite[]>
}

export class ReferentielApiService implements ReferentielService {
  constructor(private readonly apiClient: ApiClient) {}

  async getAgences(structure: string, accessToken: string): Promise<Agence[]> {
    const { content: agences } = await this.apiClient.get<Agence[]>(
      `/referentiels/agences?structure=${structure}`,
      accessToken
    )
    return agences
  }

  async getCommunesEtDepartements(query: string) {
    const session = await getSession()

    const { content: communesEtDepartements } = await this.apiClient.get<
      Localite[]
    >(
      `/referentiels/communes-et-departements?recherche=${encodeURIComponent(
        query
      )}`,
      session!.accessToken
    )
    return communesEtDepartements
  }
}
