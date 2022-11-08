import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'

export interface SuggestionsService {
  postSuggestionOffreEmploi(
    idsJeunes: string[],
    titre: string,
    motCles: string,
    localiteLabel: string,
    departement?: string,
    commune?: string
  ): Promise<void>
}

export class SuggestionsApiService implements SuggestionsService {
  constructor(private readonly apiClient: ApiClient) {}

  async postSuggestionOffreEmploi(
    idsJeunes: string[],
    titre: string,
    labelLocalite: string,
    motsCles: string,
    codeDepartement?: string,
    codeCommune?: string
  ): Promise<void> {
    const session = await getSession()
    const accessToken = session!.accessToken
    const idConseiller = session!.user.id

    await this.apiClient.post(
      `/conseillers/${idConseiller}/recherches/suggestions/offres-emploi`,
      {
        idsJeunes,
        titre,
        q: motsCles,
        localisation: labelLocalite,
        departement: codeDepartement,
        commune: codeCommune,
      },
      accessToken
    )
  }
}
