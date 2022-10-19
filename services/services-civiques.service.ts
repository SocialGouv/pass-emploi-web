import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import {
  jsonToDetailServiceCivique,
  jsonToServiceCiviqueItem,
  ServiceCiviqueItemJson,
} from 'interfaces/json/service-civique'
import {
  BaseServiceCivique,
  DetailServiceCivique,
  MetadonneesOffres,
} from 'interfaces/offre'
import { Commune } from 'interfaces/referentiel'
import { ApiError } from 'utils/httpClient'

export type SearchServicesCiviquesQuery = {
  commune?: Commune
  domaine?: string
  dateDebut?: DateTime
  rayon?: number
}

export interface ServicesCiviquesService {
  getLienServiceCivique(idOffreEngagement: string): Promise<string | undefined>
  getServiceCiviqueServerSide(
    idServiceCivique: string,
    accessToken: string
  ): Promise<DetailServiceCivique | undefined>
  searchServicesCiviques(
    query: SearchServicesCiviquesQuery,
    page: number
  ): Promise<{ offres: BaseServiceCivique[]; metadonnees: MetadonneesOffres }>
}
export class ServicesCiviquesApiService implements ServicesCiviquesService {
  constructor(private readonly apiClient: ApiClient) {}

  //TODO evolution : a supprimer comme on a getServiceCivique maintenant
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

  // TODO : a typé
  private async getServiceCivique(
    idServiceCivique: string,
    accessToken: string
  ) {
    try {
      const { content: serviceCiviqueJson } = await this.apiClient.get(
        `/services-civique/${idServiceCivique}`,
        accessToken
      )
      return serviceCiviqueJson
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }
      throw e
    }
  }

  async getServiceCiviqueServerSide(
    idServiceCivique: string,
    accessToken: string
  ): Promise<DetailServiceCivique | undefined> {
    const serviceCiviqueJson = await this.getServiceCivique(
      idServiceCivique,
      accessToken
    )

    return jsonToDetailServiceCivique(
      idServiceCivique,
      serviceCiviqueJson as ServiceCiviqueItemJson
    )
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

  const { commune, domaine, dateDebut, rayon } = query
  if (commune) {
    searchParams.set('lon', commune.longitude.toString(10))
    searchParams.set('lat', commune.latitude.toString(10))
  }
  if (domaine) searchParams.set('domaine', domaine)
  if (dateDebut) searchParams.set('dateDeDebutMinimum', dateDebut.toISO())
  if (rayon) searchParams.set('distance', rayon.toString(10))

  return searchParams
}
