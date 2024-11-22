import { getSession } from 'next-auth/react'

import { apiGet } from 'clients/api.client'
import {
  ActionPredefinie,
  SituationNonProfessionnelle,
} from 'interfaces/action'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import {
  Agence,
  Commune,
  Localite,
  Metier,
  MotifSuppressionBeneficiaire,
  TypeEvenementReferentiel,
} from 'interfaces/referentiel'

const CACHE_TAG_REFETENTIEL = 'referentiel'

// ******* READ *******
export function getAgencesServerSide(
  structure: string,
  accessToken: string
): Promise<Agence[]> {
  return getAgences(structure, accessToken)
}

export async function getAgencesClientSide(
  structure: string
): Promise<Agence[]> {
  const session = await getSession()
  return getAgences(structure, session!.accessToken)
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
    session!.accessToken,
    CACHE_TAG_REFETENTIEL
  )
  return metiers
}

export async function getActionsPredefinies(
  accessToken: string
): Promise<ActionPredefinie[]> {
  const { content: actionsPredefinies } = await apiGet<ActionPredefinie[]>(
    `/referentiels/actions-predefinies`,
    accessToken,
    CACHE_TAG_REFETENTIEL
  )
  return actionsPredefinies
}

export async function getSituationsNonProfessionnelles(
  { avecNonSNP }: { avecNonSNP: boolean },
  accessToken: string
): Promise<SituationNonProfessionnelle[]> {
  const { content } = await apiGet<SituationNonProfessionnelle[]>(
    '/referentiels/qualifications-actions/types',
    accessToken,
    CACHE_TAG_REFETENTIEL
  )
  return avecNonSNP
    ? content
    : content.filter(
        (categorie) => categorie.code !== CODE_QUALIFICATION_NON_SNP
      )
}

export async function getTypesRendezVous(
  accessToken: string
): Promise<TypeEvenementReferentiel[]> {
  const { content: types } = await apiGet<TypeEvenementReferentiel[]>(
    '/referentiels/types-rendezvous',
    accessToken,
    CACHE_TAG_REFETENTIEL
  )
  return types
}

export async function getMotifsSuppression(): Promise<
  MotifSuppressionBeneficiaire[]
> {
  const session = await getSession()
  const { content: motifs } = await apiGet<MotifSuppressionBeneficiaire[]>(
    '/referentiels/motifs-suppression-jeune',
    session!.accessToken,
    CACHE_TAG_REFETENTIEL
  )
  return motifs
}

// ******* PRIVATE *******
async function getAgences(
  structure: string,
  accessToken: string
): Promise<Agence[]> {
  const { content: agences } = await apiGet<Agence[]>(
    `/referentiels/agences?structure=${structure}`,
    accessToken,
    CACHE_TAG_REFETENTIEL
  )
  return agences
}

async function getLocalites(path: string, query: string): Promise<Localite[]> {
  const session = await getSession()
  const { content: localites } = await apiGet<Localite[]>(
    path + `recherche=${encodeURIComponent(query)}`,
    session!.accessToken,
    CACHE_TAG_REFETENTIEL
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
