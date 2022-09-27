import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import {
  DetailOffreEmploiJson,
  jsonToDetailOffreEmploi,
  jsonToOffreEmploiItem,
  OffreEmploiItemJson,
} from 'interfaces/json/offre'
import { OffreEmploiItem, DetailOffreEmploi } from 'interfaces/offre-emploi'
import { ApiError } from 'utils/httpClient'

export interface OffresEmploiService {
  getLienOffreEmploi(idOffreEmploi: string): Promise<string | undefined>
  getOffreEmploiServerSide(
    idOffreEmploi: string,
    accessToken: string
  ): Promise<DetailOffreEmploi | undefined>
  searchOffresEmploi(recherche: {
    motsCles?: string
    departement?: string
    commune?: string
  }): Promise<OffreEmploiItem[]>
}

export class OffresEmploiApiService implements OffresEmploiService {
  constructor(private readonly apiClient: ApiClient) {}

  async getLienOffreEmploi(idOffreEmploi: string): Promise<string | undefined> {
    const session = await getSession()
    const accessToken = session!.accessToken

    const offre = await this.getOffreEmploi(idOffreEmploi, accessToken)
    return offre?.urlPostulation
  }

  async getOffreEmploiServerSide(
    idOffreEmploi: string,
    accessToken: string
  ): Promise<DetailOffreEmploi | undefined> {
    return this.getOffreEmploi(idOffreEmploi, accessToken)
  }

  async searchOffresEmploi(
    options: {
      motsCles?: string
      departement?: string
      commune?: string
    } = {}
  ): Promise<OffreEmploiItem[]> {
    const session = await getSession()
    const accessToken = session!.accessToken

    const searchUrl = buildSearchUrl(options)
    const { content } = await this.apiClient.get<{
      results: OffreEmploiItemJson[]
    }>(searchUrl, accessToken)

    return content.results.map(jsonToOffreEmploiItem)
  }

  private async getOffreEmploi(
    idOffreEmploi: string,
    accessToken: string
  ): Promise<DetailOffreEmploi | undefined> {
    try {
      const { content: offreEmploiJson } =
        await this.apiClient.get<DetailOffreEmploiJson>(
          `/offres-emploi/${idOffreEmploi}`,
          accessToken
        )
      return jsonToDetailOffreEmploi(offreEmploiJson)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }
      throw e
    }
  }
}

function buildSearchUrl({
  commune,
  departement,
  motsCles,
}: {
  motsCles?: string
  departement?: string
  commune?: string
}): string {
  const path = `/offres-emploi?alternance=false`
  const queryMotsCles = motsCles ? `&q=${encodeURIComponent(motsCles)}` : ''
  const queryDepartement = departement ? `&departement=${departement}` : ''
  const queryCommune = commune ? `&commune=${commune}` : ''

  return path + queryMotsCles + queryDepartement + queryCommune
}
