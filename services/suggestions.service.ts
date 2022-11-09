import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'

export interface SuggestionsService {
  envoyerSuggestionOffreEmploi(query: {
    idsJeunes: string[]
    titre: string
    motsCles: string
    labelLocalite: string
    codeDepartement?: string
    codeCommune?: string
  }): Promise<void>

  envoyerSuggestionImmersion(query: {
    idsJeunes: string[]
    titre: string
    labelMetier: string
    codeMetier: string
    labelLocalite: string
    latitude: number
    longitude: number
  }): Promise<void>
}

export class SuggestionsApiService implements SuggestionsService {
  constructor(private readonly apiClient: ApiClient) {}

  async envoyerSuggestionOffreEmploi(query: {
    idsJeunes: string[]
    titre: string
    motsCles: string
    labelLocalite: string
    codeDepartement?: string
    codeCommune?: string
  }): Promise<void> {
    const session = await getSession()
    const accessToken = session!.accessToken
    const idConseiller = session!.user.id

    await this.apiClient.post(
      `/conseillers/${idConseiller}/recherches/suggestions/offres-emploi`,
      {
        idsJeunes: query.idsJeunes,
        titre: query.titre,
        q: query.motsCles,
        localisation: query.labelLocalite,
        departement: query.codeDepartement,
        commune: query.codeCommune,
      },
      accessToken
    )
  }

  async envoyerSuggestionImmersion(query: {
    idsJeunes: string[]
    titre: string
    labelMetier: string
    codeMetier: string
    labelLocalite: string
    latitude: number
    longitude: number
  }): Promise<void> {
    const session = await getSession()
    const accessToken = session!.accessToken
    const idConseiller = session!.user.id

    await this.apiClient.post(
      `/conseillers/${idConseiller}/recherches/suggestions/immersions`,
      {
        idsJeunes: query.idsJeunes,
        titre: query.titre,
        metier: query.labelMetier,
        rome: query.codeMetier,
        localisation: query.labelLocalite,
        lat: query.latitude,
        lon: query.longitude,
      },
      accessToken
    )
  }
}
