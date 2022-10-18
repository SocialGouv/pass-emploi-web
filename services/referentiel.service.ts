import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { ActionPredefinie } from 'interfaces/action'
import { Agence, Commune, Localite, Metier } from 'interfaces/referentiel'

export interface ReferentielService {
  getAgences(structure: string, accessToken: string): Promise<Agence[]>

  getCommunesEtDepartements(query: string): Promise<Localite[]>

  getCommunes(query: string): Promise<Commune[]>
  getActionsPredefinies(accessToken: string): Promise<ActionPredefinie[]>
  getMetiers(query: string): Promise<Metier[]>
}

export type TempJsonAgence = {
  id: string
  nom: string
}

export class ReferentielApiService implements ReferentielService {
  constructor(private readonly apiClient: ApiClient) {}

  async getAgences(structure: string, accessToken: string): Promise<Agence[]> {
    const { content: agences } = await this.apiClient.get<TempJsonAgence[]>(
      `/referentiels/agences?structure=${structure}`,
      accessToken
    )
    return agences.map((jsonAgence) => ({
      id: jsonAgence.id,
      nom: jsonAgence.nom,
      departement: (+jsonAgence.id % 50).toString(),
    }))
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

  async getMetiers(query: string): Promise<Metier[]> {
    const session = await getSession()
    const { content: metiers } = await this.apiClient.get<Metier[]>(
      `/referentiels/metiers?recherche=${encodeURIComponent(query)}`,
      session!.accessToken
    )
    return metiers
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

  async getActionsPredefinies(
    accessToken: string
  ): Promise<ActionPredefinie[]> {
    const { content: actionsPredefinies } = await this.apiClient.get<
      ActionPredefinie[]
    >(`/referentiels/actions-predefinies`, accessToken)
    return actionsPredefinies
  }
}
