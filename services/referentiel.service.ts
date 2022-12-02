import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { ActionPredefinie } from 'interfaces/action'
import { Agence, Commune, Localite, Metier } from 'interfaces/referentiel'

export interface ReferentielService {
  getAgencesServerSide(
    structure: string,
    accessToken: string
  ): Promise<Agence[]>
  getAgencesClientSide(structure: string): Promise<Agence[]>

  getCommunesEtDepartements(query: string): Promise<Localite[]>

  getCommunes(query: string): Promise<Commune[]>

  getActionsPredefinies(accessToken: string): Promise<ActionPredefinie[]>

  getMetiers(query: string): Promise<Metier[]>
}

export class ReferentielApiService implements ReferentielService {
  constructor(private readonly apiClient: ApiClient) {}

  async getAgencesServerSide(
    structure: string,
    accessToken: string
  ): Promise<Agence[]> {
    return this.getAgences(structure, accessToken)
  }

  async getAgencesClientSide(structure: string): Promise<Agence[]> {
    const session = await getSession()
    return this.getAgences(structure, session!.accessToken)
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

  private async getAgences(
    structure: string,
    accessToken: string
  ): Promise<Agence[]> {
    const { content: agences } = await this.apiClient.get<Agence[]>(
      `/referentiels/agences?structure=${structure}`,
      accessToken
    )
    return agences
  }

  private async getLocalites(path: string, query: string): Promise<Localite[]> {
    const session = await getSession()

    const { content: localites } = await this.apiClient.get<Localite[]>(
      path + `recherche=${encodeURIComponent(query)}`,
      session!.accessToken
    )

    return Array.from(
      new Map(
        localites.map((json) => [json.code, jsonToLocalite(json)])
      ).values()
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

function jsonToLocalite(json: Localite): Localite {
  if (json.type === 'COMMUNE')
    return {
      ...json,
      libelle: `${json.libelle} (${json.code.slice(0, 2)})`,
    }
  return json
}
