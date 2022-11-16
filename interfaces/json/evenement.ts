import { DateTime } from 'luxon'

import {
  AnimationCollective,
  Evenement,
  EvenementListItem,
  TYPE_EVENEMENT,
  TypeEvenement,
} from 'interfaces/evenement'
import { BaseJeune } from 'interfaces/jeune'

export type EvenementJson = {
  id: string
  date: string
  duration: number
  type: TypeEvenement
  modality: string
  jeunes: BaseJeune[]
  precision?: string
  title?: string
  comment?: string
  presenceConseiller?: boolean
  invitation?: boolean
  adresse?: string
  organisme?: string
  createur?: { id: string; nom: string; prenom: string }
}

export type EvenementJeuneJson = Omit<EvenementJson, 'jeunes'> & {
  jeune: BaseJeune
}

export type AnimationCollectiveJson = EvenementJson & {
  statut: 'A_VENIR' | 'A_CLOTURER' | 'CLOTUREE'
}

export interface EvenementFormData {
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

export function jsonToEvenement(evenementJson: EvenementJson): Evenement {
  const { precision, createur, title, duration, ...data } = evenementJson
  return {
    ...data,
    duree: duration,
    titre: jsonToTitreEvenement(evenementJson),
    presenceConseiller: Boolean(evenementJson.presenceConseiller),
    invitation: Boolean(evenementJson.invitation),
    comment: evenementJson.comment ?? '',
    precisionType: precision ?? '',
    adresse: evenementJson.adresse ?? '',
    organisme: evenementJson.organisme ?? '',
    createur: createur ?? null,
  }
}

export function evenementJeuneJsonToListItem(
  evenementJeuneJson: EvenementJeuneJson
): EvenementListItem {
  const { jeune, ...data } = evenementJeuneJson
  return jsonToListItem({ ...data, jeunes: [jeune] })
}

export function jsonToListItem(json: EvenementJson): EvenementListItem {
  const evenementListItem: EvenementListItem = {
    id: json.id,
    beneficiaires: jsonToBeneficiaires(json.jeunes),
    type: json.type.label,
    modality: json.modality,
    date: json.date,
    duree: json.duration,
  }
  if (json.createur?.id) evenementListItem.idCreateur = json.createur.id
  return evenementListItem
}

export function jsonToAnimationCollective(
  json: AnimationCollectiveJson
): AnimationCollective {
  return {
    id: json.id,
    type: json.type.label,
    titre: jsonToTitreEvenement(json),
    date: DateTime.fromISO(json.date),
    duree: json.duration,
    statut: json.statut,
  }
}

function jsonToTitreEvenement(json: EvenementJson): string {
  const typeLabel =
    json.type.code === TYPE_EVENEMENT.Autre && json.precision
      ? json.precision
      : json.type.label
  return json.title || `${typeLabel} ${json.modality}`
}

function jsonToBeneficiaires(jeunes: BaseJeune[]) {
  if (jeunes.length > 1) return 'Bénéficiaires multiples'
  if (jeunes.length === 1) return jeunes[0].prenom + ' ' + jeunes[0].nom
  return ''
}
