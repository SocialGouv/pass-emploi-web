import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import {
  DetailImmersionJson,
  ImmersionItemJson,
  jsonToDetailImmersion,
} from 'interfaces/json/immersion'
import {
  BaseImmersion,
  DetailImmersion,
  MetadonneesOffres,
  TypeOffre,
} from 'interfaces/offre'
import { Commune, Metier } from 'interfaces/referentiel'
import { ApiError } from 'utils/httpClient'

export type SearchImmersionsQuery = {
  commune: Commune
  metier: Metier
  rayon: number
}

export interface ImmersionsService {
  getImmersionServerSide(
    idImmersion: string,
    accessToken: string
  ): Promise<DetailImmersion | undefined>
  searchImmersions(
    query: SearchImmersionsQuery,
    page: number
  ): Promise<{ offres: BaseImmersion[]; metadonnees: MetadonneesOffres }>
}

export class ImmersionsApiService implements ImmersionsService {
  private cache:
    | { query: SearchImmersionsQuery; resultsJson: ImmersionItemJson[] }
    | undefined
  private LIMIT = 10

  constructor(private readonly apiClient: ApiClient) {}

  async getImmersionServerSide(
    idImmersion: string,
    accessToken: string
  ): Promise<DetailImmersion | undefined> {
    try {
      const { content: immersionJson } =
        await this.apiClient.get<DetailImmersionJson>(
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

  async searchImmersions(
    query: SearchImmersionsQuery,
    page: number
  ): Promise<{ offres: BaseImmersion[]; metadonnees: MetadonneesOffres }> {
    let immersionsJson: ImmersionItemJson[]
    if (this.cache && areSameQueries(this.cache.query, query)) {
      immersionsJson = this.cache.resultsJson
    } else {
      const session = await getSession()

      const path = '/offres-immersion?'
      const searchParams = buildSearchParams(query)
      const result = await this.apiClient.get<ImmersionItemJson[]>(
        path + searchParams,
        session!.accessToken
      )
      immersionsJson = result.content
      this.cache = { query, resultsJson: immersionsJson }
    }

    const metadonnees: MetadonneesOffres = {
      nombreTotal: immersionsJson.length,
      nombrePages: Math.ceil(immersionsJson.length / this.LIMIT),
    }

    return {
      metadonnees,
      offres: immersionsJson
        .slice(this.LIMIT * (page - 1), page * this.LIMIT)
        .map(({ metier, ...immersion }) => ({
          type: TypeOffre.IMMERSION,
          titre: metier,
          ...immersion,
        })),
    }
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
