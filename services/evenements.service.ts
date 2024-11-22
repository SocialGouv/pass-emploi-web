import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import {
  AnimationCollective,
  AnimationCollectivePilotage,
  Evenement,
  EvenementListItem,
} from 'interfaces/evenement'
import {
  AnimationCollectiveJson,
  EvenementFormData,
  EvenementJeuneJson,
  EvenementJson,
  jsonToAnimationCollective,
  jsonToEvenement,
  jsonToListItem,
} from 'interfaces/json/evenement'
import { CACHE_TAGS } from 'services/cache-tags'
import { MetadonneesPagination } from 'types/pagination'
import { ApiError } from 'utils/httpClient'

// ******* READ *******
export async function getRendezVousConseiller(
  idConseiller: string,
  dateDebut: DateTime,
  dateFin: DateTime
): Promise<EvenementListItem[]> {
  const session = await getSession()
  const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
  const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())
  const { content: rdvsJson } = await apiGet<EvenementJson[]>(
    `/v2/conseillers/${idConseiller}/rendezvous?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
    session!.accessToken,
    CACHE_TAGS.EVENEMENT.LISTE
  )
  return rdvsJson.map(jsonToListItem)
}

export async function getRendezVousJeune(
  idJeune: string,
  periode: string,
  accessToken: string
): Promise<EvenementListItem[]> {
  const { content: rdvsJson } = await apiGet<EvenementJeuneJson[]>(
    `/jeunes/${idJeune}/rendezvous?periode=${periode}`,
    accessToken,
    CACHE_TAGS.EVENEMENT.LISTE
  )

  return rdvsJson.map(jsonToListItem)
}

export async function getRendezVousEtablissement(
  idEtablissement: string,
  dateDebut: DateTime,
  dateFin: DateTime
): Promise<AnimationCollective[]> {
  const session = await getSession()
  const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
  const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())
  const { content: animationsCollectivesJson } = await apiGet<
    AnimationCollectiveJson[]
  >(
    `/etablissements/${idEtablissement}/animations-collectives?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
    session!.accessToken,
    CACHE_TAGS.EVENEMENT.LISTE
  )

  return animationsCollectivesJson.map(jsonToAnimationCollective)
}

export async function getAnimationsCollectivesACloreClientSide(
  idEtablissement: string,
  page: number
): Promise<{
  animationsCollectives: AnimationCollectivePilotage[]
  metadonnees: MetadonneesPagination
}> {
  const session = await getSession()

  return getAnimationsCollectivesAClore(
    idEtablissement,
    page,
    session!.accessToken
  )
}

export async function getAnimationsCollectivesACloreServerSide(
  idEtablissement: string,
  accessToken: string
): Promise<{
  animationsCollectives: AnimationCollectivePilotage[]
  metadonnees: MetadonneesPagination
}> {
  return getAnimationsCollectivesAClore(idEtablissement, 1, accessToken)
}

export async function getDetailsEvenement(
  idRdv: string,
  accessToken: string
): Promise<Evenement | undefined> {
  try {
    const { content: rdvJson } = await apiGet<EvenementJson>(
      `/rendezvous/${idRdv}`,
      accessToken,
      CACHE_TAGS.EVENEMENT.SINGLETON
    )
    return jsonToEvenement(rdvJson)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return undefined
    }
    throw e
  }
}

// ******* WRITE *******
export async function creerEvenement(
  newRDV: EvenementFormData
): Promise<string> {
  const session = await getSession()
  const {
    content: { id },
  } = await apiPost<{ id: string }>(
    `/conseillers/${session!.user.id}/rendezvous`,
    newRDV,
    session!.accessToken
  )
  return id
}

export async function updateRendezVous(
  idRdv: string,
  updatedRdv: EvenementFormData
): Promise<void> {
  const { type, precision, invitation, ...payload } = updatedRdv
  const session = await getSession()
  await apiPut(`/rendezvous/${idRdv}`, payload, session!.accessToken)
}

export async function supprimerEvenement(idRendezVous: string): Promise<void> {
  const session = await getSession()
  await apiDelete(`/rendezvous/${idRendezVous}`, session!.accessToken)
}

export async function cloreAnimationCollective(
  idAnimationCollective: string,
  idsJeunes: string[]
): Promise<void> {
  const session = await getSession()
  const payload = { idsJeunes }
  await apiPost(
    `/structures-milo/animations-collectives/${idAnimationCollective}/cloturer`,
    payload,
    session!.accessToken
  )
}

// ******* PRIVATE *******
async function getAnimationsCollectivesAClore(
  idEtablissement: string,
  page: number,
  accessToken: string
): Promise<{
  animationsCollectives: AnimationCollectivePilotage[]
  metadonnees: MetadonneesPagination
}> {
  const {
    content: { pagination, resultats },
  } = await apiGet<{
    pagination: { total: number; limit: number }
    resultats: AnimationCollectivePilotage[]
  }>(
    `/v2/etablissements/${idEtablissement}/animations-collectives?aClore=true&page=${page}`,
    accessToken,
    CACHE_TAGS.EVENEMENT.LISTE
  )

  const nombrePages = Math.ceil(pagination.total / pagination.limit)

  return {
    animationsCollectives: resultats,
    metadonnees: {
      nombreTotal: pagination.total,
      nombrePages: nombrePages,
    },
  }
}
