import { getSession } from 'next-auth/react'

import { apiGet } from 'clients/api.client'
import { ActionPredefinie } from 'interfaces/action'
import { Agence, Commune, Localite, Metier } from 'interfaces/referentiel'
import { structureMilo } from 'interfaces/structure'

export function getAgencesServerSide(
  structure: string,
  accessToken: string
): Promise<Agence[]> {
  return getAgences(structure, accessToken)
}

export async function getMissionsLocalesClientSide(): Promise<Agence[]> {
  const session = await getSession()
  return getAgences(structureMilo, session!.accessToken)
}

export async function getCommunesEtDepartements(query: string) {
  const path = '/referentiels/communes-et-departements?'
  return getLocalites(path, query)
}

export async function getCommunes(query: string): Promise<Commune[]> {
  const path = '/referentiels/communes-et-departements?villesOnly=true&'
  const communes = await getLocalites(path, query)
  return communes as Commune[]
}

export async function getMetiers(query: string): Promise<Metier[]> {
  const session = await getSession()
  const { content: metiers } = await apiGet<Metier[]>(
    `/referentiels/metiers?recherche=${encodeURIComponent(query)}`,
    session!.accessToken
  )
  return metiers
}

export async function getActionsPredefinies(
  accessToken: string
): Promise<ActionPredefinie[]> {
  const { content: actionsPredefinies } = await apiGet<ActionPredefinie[]>(
    `/referentiels/actions-predefinies`,
    accessToken
  )
  return actionsPredefinies
}

async function getAgences(
  structure: string,
  accessToken: string
): Promise<Agence[]> {
  const { content: agences } = await apiGet<Agence[]>(
    `/referentiels/agences?structure=${structure}`,
    accessToken
  )
  return agences
}

async function getLocalites(path: string, query: string): Promise<Localite[]> {
  const session = await getSession()
  const { content: localites } = await apiGet<Localite[]>(
    path + `recherche=${encodeURIComponent(query)}`,
    session!.accessToken
  )

  return Array.from(
    new Map(localites.map((json) => [json.code, jsonToLocalite(json)])).values()
  )
}

function jsonToLocalite(json: Localite): Localite {
  if (json.type === 'COMMUNE')
    return {
      ...json,
      libelle: `${json.libelle} (${json.code.slice(0, 2)})`,
    }
  return json
}
