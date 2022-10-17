import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import {
  jsonToServiceCiviqueItem,
  ServiceCiviqueItemJson,
} from 'interfaces/json/service-civique'
import { BaseServiceCivique, MetadonneesOffres } from 'interfaces/offre'
import { ApiError } from 'utils/httpClient'

export type SearchServicesCiviquesQuery = {
  coordonnees?: { lon: number; lat: number }
  domaine?: string
  dateDebut?: DateTime
  rayon?: number
}

export interface ServicesCiviquesService {
  getLienServiceCivique(idOffreEngagement: string): Promise<string | undefined>
  searchServicesCiviques(
    query: SearchServicesCiviquesQuery,
    page: number
  ): Promise<{ offres: BaseServiceCivique[]; metadonnees: MetadonneesOffres }>
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
    query: SearchServicesCiviquesQuery,
    page: number
  ): Promise<{ offres: BaseServiceCivique[]; metadonnees: MetadonneesOffres }> {
    const session = await getSession()
    const accessToken = session!.accessToken

    const LIMIT = 10
    const path = '/v2/services-civique'
    const searchParams = buildSearchParams(query, page, LIMIT)
    const { content } = await this.apiClient.get<{
      pagination: { total: number }
      results: ServiceCiviqueItemJson[]
    }>(path + '?' + searchParams, accessToken)

    const { pagination, results } = content
    const metadonnees: MetadonneesOffres = {
      nombreTotal: pagination.total,
      nombrePages: Math.ceil(pagination.total / LIMIT),
    }
    return { metadonnees, offres: results.map(jsonToServiceCiviqueItem) }
  }
}

function buildSearchParams(
  query: SearchServicesCiviquesQuery,
  page: number,
  limit: number
): URLSearchParams {
  const searchParams = new URLSearchParams({
    page: page.toString(10),
    limit: limit.toString(10),
  })

  const { coordonnees, domaine, dateDebut, rayon } = query
  if (coordonnees) {
    searchParams.set('lon', coordonnees.lon.toString(10))
    searchParams.set('lat', coordonnees.lat.toString(10))
  }
  if (domaine) searchParams.set('domaine', domaine)
  if (dateDebut) searchParams.set('dateDeDebutMinimum', dateDebut.toISO())
  if (rayon) searchParams.set('distance', rayon.toString(10))

  return searchParams
}
