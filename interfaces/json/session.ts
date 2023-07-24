import { DateTime } from 'luxon'

import { AnimationCollective, TypeEvenement } from 'interfaces/evenement'
import { minutesEntreDeuxDates } from 'utils/date'

export type SessionMiloJson = {
  id: string
  nomSession: string
  nomOffre: string
  dateHeureDebut: string
  dateHeureFin: string
  estVisible: boolean
  type: TypeEvenement
}

export function sessionMiloJsonToAnimationCollective(
  json: SessionMiloJson
): AnimationCollective {
  const dateDebut = DateTime.fromISO(json.dateHeureDebut)
  return {
    id: json.id,
    date: dateDebut,
    duree: minutesEntreDeuxDates(
      dateDebut,
      DateTime.fromISO(json.dateHeureFin)
    ),
    statut: undefined,
    titre: json.nomOffre,
    sousTitre: json.nomSession,
    type: jsonToTypeSessionMilo(json.type),
    isSession: true,
    estCache: !json.estVisible,
  }
}

function jsonToTypeSessionMilo(jsonType: TypeEvenement): string {
  if (jsonType.code === 'COLLECTIVE_INFORMATION') {
    return 'info coll i-milo'
  }
  return 'Atelier i-milo'
}
