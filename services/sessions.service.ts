import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiGet } from 'clients/api.client'
import { AnimationCollective } from 'interfaces/evenement'
import {
  SessionMiloJson,
  sessionMiloJsonToAnimationCollective,
} from 'interfaces/json/session'

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
