import { DateTime } from 'luxon'

import { AnimationCollective, TypeEvenement } from 'interfaces/evenement'
import { dureeEntreDeuxDates } from 'utils/date'

export type SessionMiloJson = {
  id: string
  nomSession: string
  nomOffre: string
  dateHeureDebut: string
  dateHeureFin: string
  type: TypeEvenement
}

export function sessionMiloJsonToAnimationCollective(
  json: SessionMiloJson
): AnimationCollective {
  const dateDebut = DateTime.fromISO(json.dateHeureDebut)
  //FIXME: valider avec design
  return {
    id: json.id,
    date: dateDebut,
    duree: dureeEntreDeuxDates(dateDebut, DateTime.fromISO(json.dateHeureFin)),
    statut: undefined,
    // titre: `${json.nomOffre} - ${json.nomSession}`,
    titre: json.nomOffre,
    sousTitre: json.nomSession,
    type: jsonToTypeSessionMilo(json.type),
  }
}

function jsonToTypeSessionMilo(jsonType: TypeEvenement): string {
  if (jsonType.code === 'COLLECTIVE_INFORMATION') {
    return 'info coll i-milo'
  }
  return jsonType.label
}
