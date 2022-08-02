import {
  jsonToOffre,
  jsonToRecherche,
  OffreJson,
  RechercheJson,
} from '../interfaces/json/favoris'

import { ApiClient } from 'clients/api.client'
import { Offre, Recherche } from 'interfaces/favoris'

export interface FavorisService {
  getOffres(idJeune: string, accessToken: string): Promise<Offre[]>

  getRecherches(idJeune: string, accessToken: string): Promise<Recherche[]>
}

export class FavorisApiService implements FavorisService {
  constructor(private readonly apiClient: ApiClient) {}

  async getOffres(idJeune: string, accessToken: string): Promise<Offre[]> {
    const { content: offresJson } = await this.apiClient.get<OffreJson[]>(
      `/jeunes/${idJeune}/favoris`,
      accessToken
    )
    return offresJson.map(jsonToOffre)
  }

  async getRecherches(
    idJeune: string,
    accessToken: string
  ): Promise<Recherche[]> {
    const { content: recherchesJson } = await this.apiClient.get<
      RechercheJson[]
    >(`/jeunes/${idJeune}/recherches`, accessToken)
    return recherchesJson.map(jsonToRecherche)
  }
}
