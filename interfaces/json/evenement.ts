import { DateTime } from 'luxon'

import { EntreeAgenda } from 'interfaces/agenda'
import {
  getNomBeneficiaireComplet,
  IdentiteBeneficiaire,
} from 'interfaces/beneficiaire'
import {
  AnimationCollective,
  Evenement,
  EvenementListItem,
  StatutEvenement,
  TypeEvenement,
} from 'interfaces/evenement'
import {
  jsonToTypeSessionMilo,
  SessionMiloBeneficiairesJson,
} from 'interfaces/json/session'
import { structureMilo } from 'interfaces/structure'
import { minutesEntreDeuxDates, toFrenchTime } from 'utils/date'
import { filtrerUndefinedNullEtChaineVide } from 'utils/helpers'

type Auteur = { id: string; nom: string; prenom: string }

export type EvenementJson = {
  id: string
  date: string
  duration: number
  type: TypeEvenement
  jeunes: Array<IdentiteBeneficiaire & { futPresent?: boolean }>
  title: string
  createur: Auteur
  invitation: boolean
  historique?: Array<{ date: string; auteur: Auteur }>
  precision?: string
  comment?: string
  modality?: string
  presenceConseiller?: boolean
  adresse?: string
  organisme?: string
  statut: StatutEvenementJson
  source?: string
  futPresent?: boolean
  nombreMaxParticipants?: number
}

export type EvenementJeuneJson = Omit<EvenementJson, 'statut' | 'jeunes'> & {
  futPresent?: boolean
}

export type AnimationCollectiveJson = EvenementJson & {
  statut: StatutEvenementJson
}

export type StatutEvenementJson = 'A_VENIR' | 'A_CLOTURER' | 'CLOTUREE'

export type EvenementFormData = {
  date: string
  duration: number
  jeunesIds: string[]
  type: string
  presenceConseiller: boolean
  invitation: boolean
  precision?: string
  modality?: string
  adresse?: string
  organisme?: string
  titre?: string
  comment?: string
  nombreMaxParticipants?: number
}

export function jsonToEvenement(json: EvenementJson): Evenement {
  const evenement: Evenement = {
    id: json.id,
    jeunes: json.jeunes,
    date: json.date,
    createur: json.createur,
    type: json.type,
    duree: json.duration,
    titre: json.title,
    presenceConseiller: Boolean(json.presenceConseiller),
    invitation: Boolean(json.invitation),
    historique: (json.historique || []).map(jsonToHistorique),
    modality: json.modality,
    commentaire: json.comment,
    precisionType: json.precision,
    adresse: json.adresse,
    organisme: json.organisme,
    statut: jsonToStatutEvenement(json.statut),
    source: json.source,
    nombreMaxParticipants: json.nombreMaxParticipants,
  }

  return filtrerUndefinedNullEtChaineVide<Evenement>(evenement) as Evenement
}

export function jsonToListItem(
  json: EvenementJson | EvenementJeuneJson
): EvenementListItem {
  const evenement: EvenementListItem = {
    id: json.id,
    type: json.type.label,
    date: json.date,
    duree: json.duration,
    createur: json.createur,
    source: json.source,
    titre: json.title,
  }
  if (json.nombreMaxParticipants)
    evenement.nombreMaxParticipants = json.nombreMaxParticipants
  if (json.modality) evenement.modality = json.modality
  if (json.futPresent !== undefined) evenement.futPresent = json.futPresent
  if (Object.prototype.hasOwnProperty.call(json, 'jeunes')) {
    evenement.labelBeneficiaires = jsonToBeneficiaires(
      (json as EvenementJson).jeunes
    )
    evenement.beneficiaires = (json as EvenementJson).jeunes
  }

  return evenement
}

export function rdvJsonToEntree(rdv: EvenementJeuneJson): EntreeAgenda {
  const date = DateTime.fromISO(rdv.date)
  const titre = `${toFrenchTime(date)} - ${rdv.title}`

  return {
    id: rdv.id,
    date,
    type: 'evenement',
    titre,
    source: rdv.source,
  }
}

export function jsonToAnimationCollective(
  json: AnimationCollectiveJson
): AnimationCollective {
  const animationCollective: AnimationCollective = {
    id: json.id,
    type: jsonToTypeAnimationCollective(json.type),
    titre: json.title,
    date: DateTime.fromISO(json.date),
    duree: json.duration,
    statut: jsonToStatutEvenement(json.statut),
    nombreParticipants: json.jeunes.length,
    etatVisibilite: 'visible',
  }

  if (json.nombreMaxParticipants)
    animationCollective.nombreMaxParticipants = json.nombreMaxParticipants

  return animationCollective
}

export function sessionMiloJsonToEvenementListItem(
  json: SessionMiloBeneficiairesJson
): EvenementListItem {
  const dateDebut = DateTime.fromISO(json.dateHeureDebut)
  const dateFin = DateTime.fromISO(json.dateHeureFin)
  const beneficiairesSession = json.beneficiaires.map(
    ({ idJeune, nom, prenom }) => {
      return {
        id: idJeune,
        prenom,
        nom,
      }
    }
  )
  const evenement: EvenementListItem = {
    id: json.id,
    type: jsonToTypeSessionMilo(json.type),
    date: json.dateHeureDebut,
    duree: minutesEntreDeuxDates(dateDebut, dateFin),
    labelBeneficiaires: jsonToBeneficiaires(json.beneficiaires),
    source: structureMilo,
    isSession: true,
    beneficiaires: beneficiairesSession,
    titre: json.nomSession,
  }

  if (json.nbPlacesRestantes)
    evenement.nombreMaxParticipants =
      json.beneficiaires.length + json.nbPlacesRestantes

  return evenement
}

function jsonToTypeAnimationCollective(jsonType: TypeEvenement): string {
  if (jsonType.code === 'INFORMATION_COLLECTIVE') {
    return 'Information collective'
  }
  return jsonType.label
}

function jsonToStatutEvenement(
  jsonStatus: StatutEvenementJson
): StatutEvenement {
  switch (jsonStatus) {
    case 'A_VENIR':
      return StatutEvenement.AVenir
    case 'A_CLOTURER':
      return StatutEvenement.AClore
    case 'CLOTUREE':
      return StatutEvenement.Close

    default:
      console.warn(
        `Statut d'évènement ${jsonStatus} incorrect, traité comme AVenir`
      )
      return StatutEvenement.AVenir
  }
}

function jsonToBeneficiaires(
  jeunes: { nom: string; prenom: string }[]
): string | undefined {
  if (jeunes.length === 1) return getNomBeneficiaireComplet(jeunes[0])
  return 'Bénéficiaires multiples'
}

function jsonToHistorique({ date, auteur }: { date: string; auteur: Auteur }) {
  return {
    date,
    auteur: { nom: auteur.nom, prenom: auteur.prenom },
  }
}
