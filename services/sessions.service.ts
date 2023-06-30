import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiGet } from 'clients/api.client'
import { AnimationCollective } from 'interfaces/evenement'
import {
  SessionMiloJson,
  sessionMiloJsonToAnimationCollective,
} from 'interfaces/json/session'
import { SessionJson } from 'interfaces/json/session'
import { jsonToSession, Session } from 'interfaces/session'
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
): Promise<Session | undefined> {
  try {
    const { content: sessionJson } = await apiGet<SessionJson>(
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
