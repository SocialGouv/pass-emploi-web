import { DateTime } from 'luxon'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import {
  BaseConseiller,
  Conseiller,
  StructureConseiller,
} from 'interfaces/conseiller'
import { BaseJeune, DossierMilo } from 'interfaces/jeune'
import {
  BaseConseillerJson,
  ConseillerJson,
  jsonToBaseConseiller,
  jsonToConseiller,
} from 'interfaces/json/conseiller'
import { JeuneMiloFormData } from 'interfaces/json/jeune'

export async function getConseillerServerSide(
  user: Session.HydratedUser,
  accessToken: string
): Promise<Conseiller> {
  const { content: conseillerJson } = await apiGet<ConseillerJson>(
    `/conseillers/${user.id}`,
    accessToken
  )
  return jsonToConseiller(conseillerJson, user)
}

export async function getConseillers(
  recherche: string,
  structure?:
    | StructureConseiller.POLE_EMPLOI
    | StructureConseiller.POLE_EMPLOI_BRSA
): Promise<BaseConseiller[]> {
  const session = await getSession()
  let filtreStructure = ''
  if (structure) {
    filtreStructure = `&structure=${structure}`
  }
  const { content } = await apiGet<BaseConseillerJson[]>(
    `/conseillers?q=${recherche}${filtreStructure}`,
    session!.accessToken
  )
  return content.map(jsonToBaseConseiller)
}

export async function modifierAgence({
  id,
  nom,
}: {
  id?: string
  nom: string
}): Promise<void> {
  const session = await getSession()
  const agence = id ? { id } : { nom }
  return apiPut(
    `/conseillers/${session!.user.id}`,
    { agence },
    session!.accessToken
  )
}

export async function modifierDateSignatureCGU(date: DateTime): Promise<void> {
  const session = await getSession()
  return apiPut(
    `/conseillers/${session!.user.id}`,
    { dateSignatureCGU: date },
    session!.accessToken
  )
}

export async function modifierNotificationsSonores(
  idConseiller: string,
  hasNotificationsSonores: boolean
): Promise<void> {
  const session = await getSession()
  return apiPut(
    `/conseillers/${idConseiller}`,
    { notificationsSonores: hasNotificationsSonores },
    session!.accessToken
  )
}

export async function getDossierJeune(
  idDossier: string
): Promise<DossierMilo | undefined> {
  const session = await getSession()
  const { content: dossier } = await apiGet<DossierMilo | undefined>(
    `/conseillers/milo/dossiers/${idDossier}`,
    session!.accessToken
  )
  return dossier
}

export async function createCompteJeuneMilo(
  newJeune: JeuneMiloFormData
): Promise<BaseJeune> {
  const session = await getSession()
  const { content } = await apiPost<BaseJeune>(
    `/conseillers/milo/jeunes`,
    { ...newJeune, idConseiller: session!.user.id },
    session!.accessToken
  )
  return content
}

export async function recupererBeneficiaires(): Promise<void> {
  const session = await getSession()
  await apiPost(
    `/conseillers/${session!.user.id}/recuperer-mes-jeunes`,
    {},
    session!.accessToken
  )
}

export async function supprimerConseiller(idConseiller: string): Promise<void> {
  const session = await getSession()
  await apiDelete(`/conseillers/${idConseiller}`, session!.accessToken)
}
