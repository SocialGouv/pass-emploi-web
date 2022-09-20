import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { ApiError } from 'utils/httpClient'

export interface OffresEmploiService {
  getLienOffreEmploi(idOffreEmploi: string): Promise<string | undefined>
  searchOffresEmploi(recherche: {
    query: string
  }): Promise<Array<{ titre: string }>>
}

export class OffresEmploiApiService implements OffresEmploiService {
  constructor(private readonly apiClient: ApiClient) {}

  async getLienOffreEmploi(idOffreEmploi: string): Promise<string | undefined> {
    const session = await getSession()
    const accessToken = session!.accessToken

    try {
      const { content: offreEmploiJson } = await this.apiClient.get<{
        urlRedirectPourPostulation: string
      }>(`/offres-emploi/${idOffreEmploi}`, accessToken)
      return offreEmploiJson.urlRedirectPourPostulation
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }
      throw e
    }
  }

  async searchOffresEmploi({
    query,
  }: {
    query: string
  }): Promise<Array<{ titre: string }>> {
    const session = await getSession()
    const accessToken = session!.accessToken

    const { content } = await this.apiClient.get<{
      results: Array<{ titre: string }>
    }>(
      `/offres-emploi?alternance=false&q=${encodeURIComponent(query)}`,
      accessToken
    )

    return content.results
  }
}
