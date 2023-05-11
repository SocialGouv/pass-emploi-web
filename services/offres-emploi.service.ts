import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  DetailOffreEmploiJson,
  jsonToDetailOffreEmploi,
  jsonToOffreEmploiItem,
  OffreEmploiItemJson,
} from 'interfaces/json/offre-emploi'
import { BaseOffreEmploi, DetailOffreEmploi, TypeOffre } from 'interfaces/offre'
import { Commune, Departement } from 'interfaces/referentiel'
import { MetadonneesPagination } from 'types/pagination'
import { ApiError } from 'utils/httpClient'

enum FiltreOffres {
  ALTERNANCE = 'ALTERNANCE',
  EMPLOI = 'EMPLOI',
}
export type TypeContrat = 'CDI' | 'CDD-interim-saisonnier' | 'autre'
export type Duree = 'Temps plein' | 'Temps partiel'
export type SearchOffresEmploiQuery = {
  idOffre?: string
  motsCles?: string
  commune?: Commune
  debutantAccepte?: boolean
  departement?: Departement
  durees?: Array<Duree>
  rayon?: number
  typesContrats?: Array<TypeContrat>
}

export interface OffresEmploiService {
  getOffreEmploiServerSide(
    idOffreEmploi: string,
    accessToken: string
  ): Promise<DetailOffreEmploi | undefined>

  getOffreEmploiClientSide(
    idOffreEmploi: string
  ): Promise<DetailOffreEmploi | undefined>

  searchOffresEmploi(
    recherche: SearchOffresEmploiQuery,
    page: number
  ): Promise<{ offres: BaseOffreEmploi[]; metadonnees: MetadonneesPagination }>

  searchAlternances(
    recherche: SearchOffresEmploiQuery,
    page: number
  ): Promise<{ offres: BaseOffreEmploi[]; metadonnees: MetadonneesPagination }>
}

export class OffresEmploiApiService implements OffresEmploiService {
  constructor(private readonly apiClient: ApiClient) {}

  async getOffreEmploiServerSide(
    idOffreEmploi: string,
    accessToken: string
  ): Promise<DetailOffreEmploi | undefined> {
    return this.getOffreEmploi(idOffreEmploi, accessToken)
  }

  async getOffreEmploiClientSide(
    idOffreEmploi: string
  ): Promise<DetailOffreEmploi | undefined> {
    const session = await getSession()
    return this.getOffreEmploi(idOffreEmploi, session!.accessToken)
  }

  async searchOffresEmploi(
    recherche: SearchOffresEmploiQuery,
    page: number
  ): Promise<{
    offres: BaseOffreEmploi[]
    metadonnees: MetadonneesPagination
  }> {
    return this.searchOffres({
      recherche,
      page,
      // filtreOffres: FiltreOffres.EMPLOI, // TODO  retirer et mettre dans searchOffres pour appliquer le filtre en fonction de la structure conseiller
    })
  }

  async searchAlternances(
    recherche: SearchOffresEmploiQuery,
    page: number
  ): Promise<{
    offres: BaseOffreEmploi[]
    metadonnees: MetadonneesPagination
  }> {
    return this.searchOffres({
      recherche,
      page,
      filtreOffres: FiltreOffres.ALTERNANCE,
    })
  }

  private async getOffreEmploi(idOffreEmploi: string, accessToken: string) {
    try {
      const { content: offreEmploiJson } =
        await this.apiClient.get<DetailOffreEmploiJson>(
          `/offres-emploi/${idOffreEmploi}`,
          accessToken
        )
      return offreEmploiJson && jsonToDetailOffreEmploi(offreEmploiJson)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }
      throw e
    }
  }

  private async searchOffres({
    recherche,
    page,
    filtreOffres = null,
  }: {
    recherche: SearchOffresEmploiQuery
    page: number
    filtreOffres?: FiltreOffres
  }): Promise<{
    offres: BaseOffreEmploi[]
    metadonnees: MetadonneesPagination
  }> {
    const session = await getSession()
    const accessToken = session!.accessToken

    const LIMIT = 10
    const path = '/offres-emploi'

    const filtreOffresEmploi: FiltreOffres =
      session?.user.structure === StructureConseiller.POLE_EMPLOI_BRSA
        ? FiltreOffres.EMPLOI
        : filtreOffres
    const searchUrl = buildSearchParams(
      recherche,
      page,
      LIMIT,
      filtreOffresEmploi
    )
    const { content } = await this.apiClient.get<{
      pagination: { total: number }
      results: OffreEmploiItemJson[]
    }>(path + '?' + searchUrl, accessToken)

    const { pagination, results } = content
    const metadonnees: MetadonneesPagination = {
      nombreTotal: pagination.total,
      nombrePages: Math.ceil(pagination.total / LIMIT),
    }
    return { metadonnees, offres: results.map(jsonToOffreEmploiItem) }
  }
}

function buildSearchParams(
  recherche: SearchOffresEmploiQuery,
  page: number,
  limit: number,
  filtreOffres: FiltreOffres
): string {
  const searchParams = new URLSearchParams({
    page: page.toString(10),
    limit: limit.toString(10),
  })
  if (filtreOffres === FiltreOffres.ALTERNANCE)
    searchParams.set('alternance', 'true')
  if (filtreOffres === FiltreOffres.EMPLOI)
    searchParams.set('alternance', 'false')

  const {
    durees,
    typesContrats,
    departement,
    debutantAccepte,
    commune,
    rayon,
    motsCles,
  } = recherche
  const queryMotsCles = motsCles ? `&q=${encodeURIComponent(motsCles)}` : ''
  if (departement) searchParams.set('departement', departement.code)
  if (commune) searchParams.set('commune', commune.code)
  if (rayon) searchParams.set('rayon', rayon.toString(10))
  if (debutantAccepte) searchParams.set('debutantAccepte', 'true')
  typesContrats?.forEach((typeContrat) =>
    searchParams.append('contrat', typeContrat)
  )
  durees
    ?.map(dureeToQueryParam)
    .forEach((duree) => searchParams.append('duree', duree))

  return searchParams + queryMotsCles
}

function dureeToQueryParam(duree: Duree): '1' | '2' {
  switch (duree) {
    case 'Temps plein':
      return '1'
    case 'Temps partiel':
      return '2'
  }
}
