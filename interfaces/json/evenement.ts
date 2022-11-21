import { DateTime } from 'luxon'

import { EntreeAgenda } from 'interfaces/agenda'
import {
  AnimationCollective,
  Evenement,
  EvenementListItem,
  StatutAnimationCollective,
  TypeEvenement,
} from 'interfaces/evenement'
import { BaseJeune } from 'interfaces/jeune'
import { DATETIME_LONG, toFrenchFormat } from 'utils/date'

type Auteur = { id: string; nom: string; prenom: string }
export type EvenementJson = {
  id: string
  date: string
  duration: number
  type: TypeEvenement
  modality: string
  jeunes: BaseJeune[]
  title: string
  createur: Auteur
  historique: Array<{ date: string; auteur: Auteur }>
  invitation: boolean
  precision?: string
  comment?: string
  presenceConseiller?: boolean
  adresse?: string
  organisme?: string
}

export type EvenementJeuneJson = Omit<EvenementJson, 'jeunes'> & {
  jeune: BaseJeune
}
export type AnimationCollectiveJson = EvenementJson & {
  statut: StatutAnimationCollectiveJson
}

export type StatutAnimationCollectiveJson =
  | 'A_VENIR'
  | 'A_CLOTURER'
  | 'CLOTUREE'

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
}

export function jsonToEvenement(json: EvenementJson): Evenement {
  const evenement: Evenement = {
    id: json.id,
    jeunes: json.jeunes,
    date: json.date,
    createur: json.createur,
    type: json.type,
    modality: json.modality,
    duree: json.duration,
    titre: json.title,
    presenceConseiller: Boolean(json.presenceConseiller),
    invitation: Boolean(json.invitation),
    historique: jsonToHistorique(json.historique),
  }
  if (json.comment) evenement.commentaire = json.comment
  if (json.precision) evenement.precisionType = json.precision
  if (json.adresse) evenement.adresse = json.adresse
  if (json.organisme) evenement.organisme = json.organisme

  return evenement
}

export function evenementJeuneJsonToListItem(
  evenementJeuneJson: EvenementJeuneJson
): EvenementListItem {
  const { jeune, ...data } = evenementJeuneJson
  return jsonToListItem({ ...data, jeunes: [jeune] })
}

export function jsonToListItem(json: EvenementJson): EvenementListItem {
  return {
    id: json.id,
    beneficiaires: jsonToBeneficiaires(json.jeunes),
    type: json.type.label,
    modality: json.modality,
    date: json.date,
    duree: json.duration,
    idCreateur: json.createur.id,
  }
}

export function rdvJsonToEntree(rdv: EvenementJeuneJson): EntreeAgenda {
  const date = DateTime.fromISO(rdv.date)
  const titre = `${toFrenchFormat(date, DATETIME_LONG)} - ${rdv.title}`

  return {
    id: rdv.id,
    date: date,
    type: 'evenement',
    titre,
  }
}

export function jsonToAnimationCollective(
  json: AnimationCollectiveJson
): AnimationCollective {
  return {
    id: json.id,
    type: json.type.label,
    titre: json.title,
    date: DateTime.fromISO(json.date),
    duree: json.duration,
    statut: jsonToStatutAnimationCollective(json.statut),
  }
}

function jsonToStatutAnimationCollective(
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
        `Statut d'animation collective ${jsonStatus} incorrect, traité comme AVenir`
      )
      return StatutAnimationCollective.AVenir
  }
}

function jsonToBeneficiaires(jeunes: BaseJeune[]): string {
  if (jeunes.length === 1) return jeunes[0].prenom + ' ' + jeunes[0].nom
  return 'Bénéficiaires multiples'
}

function jsonToHistorique(historique: Array<{ date: string; auteur: Auteur }>) {
  return historique.map(({ date, auteur }) => ({
    date,
    auteur: { nom: auteur.nom, prenom: auteur.prenom },
  }))
}
