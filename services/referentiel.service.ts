import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { Agence, Commune, Localite } from 'interfaces/referentiel'

export interface ReferentielService {
  getAgences(structure: string, accessToken: string): Promise<Agence[]>
  getCommunesEtDepartements(query: string): Promise<Localite[]>
  getCommunes(query: string): Promise<Commune[]>
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
    const path = '/referentiels/communes-et-departements?'
    return this.getLocalites(path, query)
  }

  async getCommunes(query: string): Promise<Commune[]> {
    const path = '/referentiels/communes-et-departements?villesOnly=true&'
    const communes = await this.getLocalites(path, query)
    return communes as Commune[]
  }

  private async getLocalites(path: string, query: string): Promise<Localite[]> {
    const session = await getSession()

    const { content: localites } = await this.apiClient.get<Localite[]>(
      path + `recherche=${encodeURIComponent(query)}`,
      session!.accessToken
    )

    return Array.from(
      new Map(localites.map((localite) => [localite.code, localite])).values()
    )
  }
}
