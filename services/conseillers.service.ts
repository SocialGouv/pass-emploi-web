import { DateTime } from 'luxon'
import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPut } from 'clients/api.client'
import { ConseillerHistorique, DossierMilo } from 'interfaces/beneficiaire'
import {
  BaseConseiller,
  Conseiller,
  StructureConseiller,
} from 'interfaces/conseiller'
import {
  BaseConseillerJson,
  ConseillerHistoriqueJson,
  ConseillerJson,
  jsonToBaseConseiller,
  jsonToConseiller,
  toConseillerHistorique,
} from 'interfaces/json/conseiller'
import { CACHE_TAGS, TAG_MILO_FIXME } from 'services/cache-tags'
import { ApiError } from 'utils/httpClient'

// ******* READ *******
export async function getConseillerServerSide(
  user: Session.HydratedUser,
  accessToken: string
): Promise<Conseiller> {
  const { content: conseillerJson } = await apiGet<ConseillerJson>(
    `/conseillers/${user.id}`,
    accessToken,
    CACHE_TAGS.CONSEILLER.SINGLETON
  )
  return jsonToConseiller(conseillerJson, user)
}

export async function getConseillers(
  recherche: string,
  structure?:
    | StructureConseiller.POLE_EMPLOI
    | StructureConseiller.POLE_EMPLOI_BRSA
    | StructureConseiller.POLE_EMPLOI_AIJ
): Promise<BaseConseiller[]> {
  const session = await getSession()
  let filtreStructure = ''
  if (structure) {
    filtreStructure = `&structure=${structure}`
  }
  const { content } = await apiGet<BaseConseillerJson[]>(
    `/conseillers?q=${recherche}${filtreStructure}`,
    session!.accessToken,
    'conseillers'
  )
  return content.map(jsonToBaseConseiller)
}

export async function getConseillersDuJeuneServerSide(
  idJeune: string,
  accessToken: string
): Promise<ConseillerHistorique[]> {
  {
    return getConseillersDuBeneficiaire(idJeune, accessToken)
  }
}

export async function getConseillersDuJeuneClientSide(
  idJeune: string
): Promise<ConseillerHistorique[]> {
  {
    const session = await getSession()
    return getConseillersDuBeneficiaire(idJeune, session!.accessToken)
  }
}

export async function getDossierJeune(
  idDossier: string
): Promise<DossierMilo | undefined> {
  const session = await getSession()
  const { content: dossier } = await apiGet<DossierMilo | undefined>(
    `/conseillers/milo/dossiers/${idDossier}`,
    session!.accessToken,
    TAG_MILO_FIXME
  )
  return dossier
}

// ******* WRITE *******
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

export async function modifierDateVisionnageActus(
  date: DateTime
): Promise<void> {
  const session = await getSession()
  return apiPut(
    `/conseillers/${session!.user.id}`,
    { dateVisionnageActus: date },
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

export async function supprimerConseiller(idConseiller: string): Promise<void> {
  const session = await getSession()
  await apiDelete(`/conseillers/${idConseiller}`, session!.accessToken)
}

// ******* PRIVATE *******
async function getConseillersDuBeneficiaire(
  idBeneficiaire: string,
  accessToken: string
): Promise<ConseillerHistorique[]> {
  {
    try {
      const { content: historique } = await apiGet<ConseillerHistoriqueJson[]>(
        `/jeunes/${idBeneficiaire}/conseillers`,
        accessToken,
        'conseillers'
      )
      return historique.map(toConseillerHistorique)
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 404) {
        return []
      }
      throw e
    }
  }
}
