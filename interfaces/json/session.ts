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

export type DetailsSessionJson = {
  session: {
    id: string
    nom: string
    dateHeureDebut: string
    dateHeureFin: string
    dateMaxInscription?: string
    lieu: string
    nbPlacesDisponibles?: number
    estVisible: boolean
    animateur?: string
    commentaire?: string
  }
  offre: {
    id: string
    nom: string
    theme: string
    type: {
      code: string
      label: string
    }
    description?: string
    nomPartenaire?: string
  }
  inscriptions: [
    {
      idJeune: string
      nom: string
      prenom: string
      statut: string
    }
  ]
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
