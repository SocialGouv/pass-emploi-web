import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiGet, apiPut } from 'clients/api.client'
import { DetailsSession } from 'interfaces/detailsSession'
import { AnimationCollective } from 'interfaces/evenement'
import { DetailsSessionJson } from 'interfaces/json/detailsSession'
import {
  SessionMiloJson,
  sessionMiloJsonToAnimationCollective,
} from 'interfaces/json/session'
import { ApiError } from 'utils/httpClient'

export async function getSessionsMissionLocale(
  idConseiller: string,
  dateDebut: DateTime,
  dateFin: DateTime
): Promise<AnimationCollective[]> {
  const session = await getSession()
  const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
  const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())
  const { content: sessionsMiloJson } = await apiGet<SessionMiloJson[]>(
    `/conseillers/milo/${idConseiller}/sessions?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
    session!.accessToken
  )
  return sessionsMiloJson.map(sessionMiloJsonToAnimationCollective)
}

export async function getDetailsSession(
  idConseiller: string,
  idSession: string,
  accessToken: string
): Promise<DetailsSession | undefined> {
  try {
    const { content: sessionJson } = await apiGet<DetailsSessionJson>(
      `/conseillers/milo/${idConseiller}/sessions/${idSession}`,
      accessToken
    )
    return jsonToSession(sessionJson)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return undefined
    }
    throw e
  }
}

export async function changerVisibiliteSession(
  idSession: string,
  estVisible: boolean
): Promise<void> {
  const session = await getSession()
  const accessToken = session!.accessToken
  const idConseiller = session!.user.id

  return apiPut(
    `/conseillers/milo/${idConseiller}/sessions/${idSession}`,
    { estVisible },
    accessToken
  )
}

export function jsonToSession(json: DetailsSessionJson): DetailsSession {
  const session: DetailsSession = {
    session: {
      id: json.session.id,
      nom: json.session.nom,
      dateHeureDebut: json.session.dateHeureDebut,
      dateHeureFin: json.session.dateHeureFin,
      lieu: json.session.lieu,
      estVisible: json.session.estVisible,
    },
    offre: {
      titre: json.offre.nom,
      theme: json.offre.theme,
      type: json.offre.type.label,
    },
  }

  if (json.offre.description) session.offre.description = json.offre.description
  if (json.offre.nomPartenaire)
    session.offre.partenaire = json.offre.nomPartenaire

  if (json.session.dateMaxInscription)
    session.session.dateMaxInscription = json.session.dateMaxInscription
  if (json.session.animateur) session.session.animateur = json.session.animateur
  if (json.session.commentaire)
    session.session.commentaire = json.session.commentaire

  return session
}
