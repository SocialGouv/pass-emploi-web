import { getSession } from 'next-auth/react'

import { apiPost } from 'clients/api.client'

export async function partagerRechercheOffreEmploi(query: {
  idsJeunes: string[]
  titre: string
  motsCles: string
  labelLocalite: string
  codeDepartement?: string
  codeCommune?: string
}): Promise<void> {
  const alternanceOnly = false
  await envoyerSuggestionOffreEmploiOuAlternance(query, alternanceOnly)
}

export async function partagerRechercheAlternance(query: {
  idsJeunes: string[]
  titre: string
  motsCles: string
  labelLocalite: string
  codeDepartement?: string
  codeCommune?: string
}): Promise<void> {
  const alternanceOnly = true
  await envoyerSuggestionOffreEmploiOuAlternance(query, alternanceOnly)
}

export async function partagerRechercheImmersion(query: {
  idsJeunes: string[]
  titre: string
  labelMetier: string
  codeMetier: string
  labelLocalite: string
  latitude: number
  longitude: number
}): Promise<void> {
  const session = await getSession()
  const accessToken = session!.accessToken
  const idConseiller = session!.user.id

  await apiPost(
    `/conseillers/${idConseiller}/recherches/suggestions/immersions`,
    {
      idsJeunes: query.idsJeunes,
      titre: query.titre,
      metier: query.labelMetier,
      rome: query.codeMetier,
      localisation: query.labelLocalite,
      lat: query.latitude,
      lon: query.longitude,
    },
    accessToken
  )
}

export async function partagerRechercheServiceCivique(query: {
  idsJeunes: string[]
  titre: string
  labelLocalite: string
  latitude: number
  longitude: number
}): Promise<void> {
  const session = await getSession()
  const accessToken = session!.accessToken
  const idConseiller = session!.user.id

  await apiPost(
    `/conseillers/${idConseiller}/recherches/suggestions/services-civique`,
    {
      idsJeunes: query.idsJeunes,
      titre: query.titre,
      localisation: query.labelLocalite,
      lat: query.latitude,
      lon: query.longitude,
    },
    accessToken
  )
}

async function envoyerSuggestionOffreEmploiOuAlternance(
  query: {
    idsJeunes: string[]
    titre: string
    motsCles: string
    labelLocalite: string
    codeDepartement?: string
    codeCommune?: string
  },
  alternanceOnly: boolean
) {
  const session = await getSession()
  const accessToken = session!.accessToken
  const idConseiller = session!.user.id

  await apiPost(
    `/conseillers/${idConseiller}/recherches/suggestions/offres-emploi`,
    {
      idsJeunes: query.idsJeunes,
      titre: query.titre,
      q: query.motsCles,
      localisation: query.labelLocalite,
      departement: query.codeDepartement,
      commune: query.codeCommune,
      alternance: alternanceOnly,
    },
    accessToken
  )
}
