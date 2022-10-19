import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { ImmersionItemJson } from 'interfaces/json/immersion'
import { BaseImmersion, TypeOffre } from 'interfaces/offre'
import { Commune, Metier } from 'interfaces/referentiel'

export type SearchImmersionsQuery = {
  commune: Commune
  metier: Metier
  rayon: number
}

export interface ImmersionsService {
  searchImmersions(query: SearchImmersionsQuery): Promise<BaseImmersion[]>
}

export class ImmersionsApiService implements ImmersionsService {
  constructor(private readonly apiClient: ApiClient) {}

  async searchImmersions(
    query: SearchImmersionsQuery
  ): Promise<BaseImmersion[]> {
    const session = await getSession()

    const path = '/offres-immersion?'
    const searchParams = buildSearchParams(query)
    const { content: immersions } = await this.apiClient.get<
      ImmersionItemJson[]
    >(path + searchParams, session!.accessToken)

    return immersions.map((immersion) => ({
      type: TypeOffre.IMMERSION,
      ...immersion,
    }))
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
