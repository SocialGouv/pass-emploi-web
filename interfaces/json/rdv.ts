import { DateTime } from 'luxon'

import { BaseJeune } from 'interfaces/jeune'
import {
  AnimationCollective,
  Rdv,
  RdvListItem,
  TYPE_RENDEZ_VOUS,
  TypeRendezVous,
} from 'interfaces/rdv'

export interface RdvJson {
  id: string
  date: string
  duration: number
  type: TypeRendezVous
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

export type RdvJeuneJson = Omit<RdvJson, 'jeunes'> & { jeune: BaseJeune }

export type AnimationCollectiveJson = RdvJson & {
  statut: 'A_VENIR' | 'A_CLOTURER' | 'CLOTUREE'
}

export interface RdvFormData {
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

export function jsonToRdv(rdvJson: RdvJson): Rdv {
  const { precision, createur, title, duration, ...data } = rdvJson
  return {
    ...data,
    duree: duration,
    titre: jsonToTitreRdv(rdvJson),
    presenceConseiller: Boolean(rdvJson.presenceConseiller),
    invitation: Boolean(rdvJson.invitation),
    comment: rdvJson.comment ?? '',
    precisionType: precision ?? '',
    adresse: rdvJson.adresse ?? '',
    organisme: rdvJson.organisme ?? '',
    createur: createur ?? null,
  }
}

export function rdvJeuneJsonToRdvListItem(
  rdvJeuneJson: RdvJeuneJson
): RdvListItem {
  const { jeune, ...data } = rdvJeuneJson
  return jsonToRdvListItem({ ...data, jeunes: [jeune] })
}

export function jsonToRdvListItem(json: RdvJson): RdvListItem {
  const rdvListItem: RdvListItem = {
    id: json.id,
    beneficiaires: jsonToBeneficiaires(json.jeunes),
    type: json.type.label,
    modality: json.modality,
    date: json.date,
    duree: json.duration,
  }
  if (json.createur?.id) rdvListItem.idCreateur = json.createur.id
  return rdvListItem
}

export function jsonToAnimationCollective(
  json: AnimationCollectiveJson
): AnimationCollective {
  return {
    id: json.id,
    type: json.type.label,
    titre: jsonToTitreRdv(json),
    date: DateTime.fromISO(json.date),
    duree: json.duration,
    statut: json.statut,
  }
}

function jsonToTitreRdv(json: RdvJson): string {
  const typeLabel =
    json.type.code === TYPE_RENDEZ_VOUS.Autre && json.precision
      ? json.precision
      : json.type.label
  return json.title || `${typeLabel} ${json.modality}`
}

function jsonToBeneficiaires(jeunes: BaseJeune[]) {
  if (jeunes.length > 1) return 'Bénéficiaires multiples'
  if (jeunes.length === 1) return jeunes[0].prenom + ' ' + jeunes[0].nom
  return ''
}
