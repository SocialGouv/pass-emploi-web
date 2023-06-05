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
import { TypeEvenementReferentiel } from 'interfaces/referentiel'
import { MetadonneesPagination } from 'types/pagination'
import { toShortDate } from 'utils/date'
import { ApiError } from 'utils/httpClient'

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
    session!.accessToken
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
    accessToken
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
    session!.accessToken
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
      accessToken
    )
    return jsonToEvenement(rdvJson)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return undefined
    }
    throw e
  }
}

export async function getTypesRendezVous(
  accessToken: string
): Promise<TypeEvenementReferentiel[]> {
  const { content: types } = await apiGet<TypeEvenementReferentiel[]>(
    '/referentiels/types-rendezvous',
    accessToken
  )
  return types
}

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
    `/etablissements/animations-collectives/${idAnimationCollective}/cloturer`,
    payload,
    session!.accessToken
  )
}

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
    accessToken
  )

  const nombrePages = Math.ceil(pagination.total / pagination.limit)

  return {
    animationsCollectives: resultats.map(({ date, ...ac }) => ({
      ...ac,
      date: toShortDate(date),
    })),
    metadonnees: {
      nombreTotal: pagination.total,
      nombrePages: nombrePages,
    },
  }
}
