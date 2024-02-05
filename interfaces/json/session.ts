import { DateTime } from 'luxon'

import { EntreeAgenda } from 'interfaces/agenda'
import {
  AnimationCollective,
  StatutAnimationCollective,
  TypeEvenement,
} from 'interfaces/evenement'
import { StatutAnimationCollectiveJson } from 'interfaces/json/evenement'
import { minutesEntreDeuxDates, toFrenchTime } from 'utils/date'

type InscriptionSessionJson = {
  idJeune: string
  nom: string
  prenom: string
  statut: string
}
export type SessionMiloBeneficiairesJson = {
  id: string
  nomSession: string
  nomOffre: string
  dateHeureDebut: string
  dateHeureFin: string
  type: TypeEvenement
  beneficiaires: InscriptionSessionJson[]
}

export type SessionMiloJson = {
  id: string
  nomSession: string
  nomOffre: string
  dateHeureDebut: string
  dateHeureFin: string
  estVisible: boolean
  type: TypeEvenement
  statut: StatutAnimationCollectiveJson
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
    statut: StatutAnimationCollectiveJson
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
  inscriptions: InscriptionSessionJson[]
}

export type SessionMiloBeneficiaireJson = {
  id: string
  nomSession: string
  nomOffre: string
  dateHeureDebut: string
  dateHeureFin: string
  type: TypeEvenement
  inscription: string
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
    statut: jsonToStatutSession(json.statut),
    titre: json.nomOffre,
    sousTitre: json.nomSession,
    type: jsonToTypeSessionMilo(json.type),
    isSession: true,
    estCache: !json.estVisible,
  }
}

export function sessionJsonToEntree(
  session: SessionMiloBeneficiaireJson
): EntreeAgenda {
  const date = DateTime.fromISO(session.dateHeureDebut)
  const titre = `${toFrenchTime(date)} - ${session.nomOffre}`

  return {
    id: session.id,
    date: date,
    source: 'MILO',
    titre,
    sousTitre: session.nomSession,
    type: 'session',
    typeSession: 'info coll i-milo',
  }
}

export function jsonToStatutSession(
  jsonStatus: StatutAnimationCollectiveJson
): StatutAnimationCollective {
  switch (jsonStatus) {
    case 'A_VENIR':
      return StatutAnimationCollective.AVenir
    case 'A_CLOTURER':
      return StatutAnimationCollective.AClore
    case 'CLOTUREE':
      return StatutAnimationCollective.Close

    default:
      console.warn(
        `Statut de session ${jsonStatus} incorrect, traité comme AVenir`
      )
      return StatutAnimationCollective.AVenir
  }
}

export function jsonToTypeSessionMilo(jsonType: TypeEvenement): string {
  if (jsonType.code === 'COLLECTIVE_INFORMATION') {
    return 'info coll i-milo'
  }
  return 'Atelier i-milo'
}
