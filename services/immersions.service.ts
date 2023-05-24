import { getSession } from 'next-auth/react'

import { apiGet } from 'clients/api.client'
import {
  DetailImmersionJson,
  ImmersionItemJson,
  jsonToDetailImmersion,
} from 'interfaces/json/immersion'
import { BaseImmersion, DetailImmersion, TypeOffre } from 'interfaces/offre'
import { Commune, Metier } from 'interfaces/referentiel'
import { MetadonneesPagination } from 'types/pagination'
import { ApiError } from 'utils/httpClient'

export type SearchImmersionsQuery = {
  commune: Commune
  metier: Metier
  rayon: number
}

let cache:
  | { query: SearchImmersionsQuery; resultsJson: ImmersionItemJson[] }
  | undefined
const LIMIT = 10

export async function getImmersionServerSide(
  idImmersion: string,
  accessToken: string
): Promise<DetailImmersion | undefined> {
  try {
    const { content: immersionJson } = await apiGet<DetailImmersionJson>(
      `/offres-immersion/${idImmersion}`,
      accessToken
    )
    return jsonToDetailImmersion(immersionJson)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return undefined
    }
    throw e
  }
}

export async function searchImmersions(
  query: SearchImmersionsQuery,
  page: number
): Promise<{ offres: BaseImmersion[]; metadonnees: MetadonneesPagination }> {
  let immersionsJson: ImmersionItemJson[]
  if (cache && areSameQueries(cache.query, query)) {
    immersionsJson = cache.resultsJson
  } else {
    const session = await getSession()

    const path = '/offres-immersion?'
    const searchParams = buildSearchParams(query)
    const result = await apiGet<ImmersionItemJson[]>(
      path + searchParams,
      session!.accessToken
    )
    immersionsJson = result.content
    cache = { query, resultsJson: immersionsJson }
  }

  const metadonnees: MetadonneesPagination = {
    nombreTotal: immersionsJson.length,
    nombrePages: Math.ceil(immersionsJson.length / LIMIT),
  }

  return {
    metadonnees,
    offres: immersionsJson
      .slice(LIMIT * (page - 1), page * LIMIT)
      .map(({ metier, ...immersion }) => ({
        type: TypeOffre.IMMERSION,
        titre: metier,
        ...immersion,
      })),
  }
}

function buildSearchParams(recherche: SearchImmersionsQuery): URLSearchParams {
  return new URLSearchParams({
    lat: recherche.commune.latitude.toString(10),
    lon: recherche.commune.longitude.toString(10),
    distance: recherche.rayon.toString(10),
    rome: recherche.metier.code,
  })
}

function areSameQueries(
  query1: SearchImmersionsQuery,
  query2: SearchImmersionsQuery
): boolean {
  return (
    query1.metier.code === query2.metier.code &&
    query1.commune.code === query2.commune.code &&
    query1.rayon === query2.rayon
  )
}
