import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import {
  DetailOffreEmploiJson,
  jsonToDetailOffreEmploi,
  jsonToOffreEmploiItem,
  OffreEmploiItemJson,
} from 'interfaces/json/offre-emploi'
import { BaseOffreEmploi, DetailOffreEmploi } from 'interfaces/offre'
import { ApiError } from 'utils/httpClient'

export type TypeContrat = 'CDI' | 'CDD-interim-saisonnier' | 'autre'
export type Duree = 'Temps plein' | 'Temps partiel'
export type SearchOffresEmploiQuery = {
  motsCles?: string
  commune?: string
  debutantAccepte?: boolean
  departement?: string
  durees?: Array<Duree>
  rayon?: number
  typesContrats?: Array<TypeContrat>
}

export interface OffresEmploiService {
  getLienOffreEmploi(idOffreEmploi: string): Promise<string | undefined>
  getOffreEmploiServerSide(
    idOffreEmploi: string,
    accessToken: string
  ): Promise<DetailOffreEmploi | undefined>
  searchOffresEmploi(
    recherche: SearchOffresEmploiQuery
  ): Promise<BaseOffreEmploi[]>
}

export class OffresEmploiApiService implements OffresEmploiService {
  constructor(private readonly apiClient: ApiClient) {}

  async getLienOffreEmploi(idOffreEmploi: string): Promise<string | undefined> {
    const session = await getSession()
    const accessToken = session!.accessToken

    const offre = await this.getOffreEmploi(idOffreEmploi, accessToken)
    return offre?.urlRedirectPourPostulation
  }

  async getOffreEmploiServerSide(
    idOffreEmploi: string,
    accessToken: string
  ): Promise<DetailOffreEmploi | undefined> {
    const offreEmploiJson = await this.getOffreEmploi(
      idOffreEmploi,
      accessToken
    )
    return offreEmploiJson && jsonToDetailOffreEmploi(offreEmploiJson)
  }

  async searchOffresEmploi(
    options: SearchOffresEmploiQuery = {}
  ): Promise<BaseOffreEmploi[]> {
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
  ): Promise<DetailOffreEmploiJson | undefined> {
    try {
      const { content: offreEmploiJson } =
        await this.apiClient.get<DetailOffreEmploiJson>(
          `/offres-emploi/${idOffreEmploi}`,
          accessToken
        )
      return offreEmploiJson
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
  typesContrats,
  durees,
  rayon,
  debutantAccepte,
}: SearchOffresEmploiQuery): string {
  const path = '/offres-emploi'
  const searchParams = new URLSearchParams({ alternance: 'false' })
  const queryMotsCles = motsCles ? `&q=${encodeURIComponent(motsCles)}` : ''
  if (departement) searchParams.set('departement', departement)
  if (commune) searchParams.set('commune', commune)
  if (rayon) searchParams.set('rayon', rayon.toString(10))
  if (debutantAccepte) searchParams.set('debutantAccepte', 'true')
  typesContrats?.forEach((typeContrat) =>
    searchParams.append('contrat', typeContrat)
  )
  durees
    ?.map(dureeToQueryParam)
    .forEach((duree) => searchParams.append('duree', duree))

  return path + '?' + searchParams + queryMotsCles
}

function dureeToQueryParam(duree: Duree): '1' | '2' {
  switch (duree) {
    case 'Temps plein':
      return '1'
    case 'Temps partiel':
      return '2'
  }
}
