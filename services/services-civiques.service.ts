import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import {
  jsonToServiceCiviqueItem,
  ServiceCiviqueItemJson,
} from 'interfaces/json/service-civique'
import { BaseServiceCivique } from 'interfaces/offre'
import { ApiError } from 'utils/httpClient'

export type SearchServicesCiviquesQuery = {
  coordonnees?: { lon: number; lat: number }
  dateDebut?: DateTime
}

export interface ServicesCiviquesService {
  getLienServiceCivique(idOffreEngagement: string): Promise<string | undefined>
  searchServicesCiviques(
    query: SearchServicesCiviquesQuery
  ): Promise<BaseServiceCivique[]>
}
export class ServicesCiviquesApiService implements ServicesCiviquesService {
  constructor(private readonly apiClient: ApiClient) {}

  async getLienServiceCivique(
    idOffreEngagement: string
  ): Promise<string | undefined> {
    const session = await getSession()
    const accessToken = session!.accessToken

    try {
      const { content: serviceCiviqueJson } = await this.apiClient.get<{
        lienAnnonce: string
      }>(`/services-civique/${idOffreEngagement}`, accessToken)
      return serviceCiviqueJson.lienAnnonce
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }
      throw e
    }
  }

  async searchServicesCiviques(
    query: SearchServicesCiviquesQuery = {}
  ): Promise<BaseServiceCivique[]> {
    const session = await getSession()
    const accessToken = session!.accessToken

    const searchUrl = buildSearchUrl(query)
    const { content } = await this.apiClient.get<ServiceCiviqueItemJson[]>(
      searchUrl,
      accessToken
    )

    return content.map(jsonToServiceCiviqueItem)
  }
}

function buildSearchUrl(query: SearchServicesCiviquesQuery): string {
  const path = '/services-civique'
  if (!Object.entries(query).length) return path

  const searchParams = new URLSearchParams()
  const { coordonnees } = query
  if (coordonnees) {
    searchParams.set('lon', coordonnees.lon.toString(10))
    searchParams.set('lat', coordonnees.lat.toString(10))
  }

  return path + '?' + searchParams
}
