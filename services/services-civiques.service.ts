import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiGet } from 'clients/api.client'
import {
  DetailServiceCiviqueJson,
  jsonToDetailServiceCivique,
  jsonToServiceCiviqueItem,
  ServiceCiviqueItemJson,
} from 'interfaces/json/service-civique'
import { BaseServiceCivique, DetailServiceCivique } from 'interfaces/offre'
import { Commune } from 'interfaces/referentiel'
import { MetadonneesPagination } from 'types/pagination'
import { ApiError } from 'utils/httpClient'

export type SearchServicesCiviquesQuery = {
  commune?: Commune
  domaine?: string
  dateDebut?: string
  rayon?: number
}

export async function getServiceCiviqueServerSide(
  idServiceCivique: string,
  accessToken: string
): Promise<DetailServiceCivique | undefined> {
  const serviceCiviqueJson = await getServiceCivique(
    idServiceCivique,
    accessToken
  )

  return (
    serviceCiviqueJson &&
    jsonToDetailServiceCivique(idServiceCivique, serviceCiviqueJson)
  )
}

export async function searchServicesCiviques(
  query: SearchServicesCiviquesQuery,
  page: number
): Promise<{
  offres: BaseServiceCivique[]
  metadonnees: MetadonneesPagination
}> {
  const session = await getSession()
  const accessToken = session!.accessToken

  const LIMIT = 10
  const path = '/v2/services-civique'
  const searchParams = buildSearchParams(query, page, LIMIT)
  const { content } = await apiGet<{
    pagination: { total: number }
    results: ServiceCiviqueItemJson[]
  }>(path + '?' + searchParams, accessToken, 'offres')

  const { pagination, results } = content
  const metadonnees: MetadonneesPagination = {
    nombreTotal: pagination.total,
    nombrePages: Math.ceil(pagination.total / LIMIT),
  }
  return { metadonnees, offres: results.map(jsonToServiceCiviqueItem) }
}

async function getServiceCivique(
  idServiceCivique: string,
  accessToken: string
): Promise<DetailServiceCiviqueJson | undefined> {
  try {
    const { content: serviceCiviqueJson } =
      await apiGet<DetailServiceCiviqueJson>(
        `/services-civique/${idServiceCivique}`,
        accessToken,
        'offre'
      )
    return serviceCiviqueJson
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return undefined
    }
    throw e
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
  if (dateDebut)
    searchParams.set('dateDeDebutMinimum', DateTime.fromISO(dateDebut).toISO())
  if (rayon) searchParams.set('distance', rayon.toString(10))

  return searchParams
}
