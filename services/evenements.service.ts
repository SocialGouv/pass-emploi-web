import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import {
  AnimationCollective,
  RdvEtAnimationCollectivePilotage,
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
import { Periode } from 'types/dates'
import { MetadonneesPagination } from 'types/pagination'
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
  idConseiller: string,
  idJeune: string,
  periode: Periode
): Promise<EvenementListItem[]> {
  const session = await getSession()
  const dateDebutUrlEncoded = encodeURIComponent(periode.debut.toISO())
  const dateFinUrlEncoded = encodeURIComponent(periode.fin.toISO())
  const { content: rdvsJson } = await apiGet<EvenementJeuneJson[]>(
    `/conseillers/${idConseiller}/jeunes/${idJeune}/rendezvous?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
    session!.accessToken
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

export async function getRdvsEtAnimationsCollectivesACloreClientSide(
  idConseiller: string,
  page: number
): Promise<{
  rdvsEtAnimationsCollectivesInitiaux: RdvEtAnimationCollectivePilotage[]
  metadonnees: MetadonneesPagination
}> {
  const session = await getSession()

  return getRdvsEtAnimationsCollectivesAClore(
    idConseiller,
    page,
    session!.accessToken
  )
}

export async function getRdvsEtAnimationsCollectivesACloreServerSide(
  idConseiller: string,
  accessToken: string
): Promise<{
  rdvsEtAnimationsCollectivesInitiaux: RdvEtAnimationCollectivePilotage[]
  metadonnees: MetadonneesPagination
}> {
  return getRdvsEtAnimationsCollectivesAClore(idConseiller, 1, accessToken)
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
    if (e instanceof ApiError && e.statusCode === 404) {
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

export async function cloreEvenement(
  idEvenement: string,
  idsBeneficiaires: string[]
): Promise<void> {
  return cloreRdvDuCEJ(idEvenement, idsBeneficiaires)
}

async function cloreRdvDuCEJ(
  idEvenement: string,
  idsJeunesPresents: string[]
): Promise<void> {
  const session = await getSession()
  const payload = { idsJeunesPresents }
  await apiPost(
    `/rendezvous/${idEvenement}/clore`,
    payload,
    session!.accessToken
  )
}

async function getRdvsEtAnimationsCollectivesAClore(
  idConseiller: string,
  page: number,
  accessToken: string
): Promise<{
  rdvsEtAnimationsCollectivesInitiaux: RdvEtAnimationCollectivePilotage[]
  metadonnees: MetadonneesPagination
}> {
  const {
    content: { pagination, resultats },
  } = await apiGet<{
    pagination: { total: number; limit: number }
    resultats: RdvEtAnimationCollectivePilotage[]
  }>(
    `/conseillers/${idConseiller}/rendezvous/a-clore?page=${page}`,
    accessToken
  )

  const nombrePages = Math.ceil(pagination.total / pagination.limit)

  return {
    rdvsEtAnimationsCollectivesInitiaux: resultats,
    metadonnees: {
      nombreTotal: pagination.total,
      nombrePages: nombrePages,
    },
  }
}
