import { DateTime } from 'luxon'

import {
  AnimationCollective,
  Evenement,
  EvenementListItem,
  TypeEvenement,
} from 'interfaces/evenement'
import { BaseJeune } from 'interfaces/jeune'

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
  statut: 'A_VENIR' | 'A_CLOTURER' | 'CLOTUREE'
}

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

export function jsonToAnimationCollective(
  json: AnimationCollectiveJson
): AnimationCollective {
  return {
    id: json.id,
    type: json.type.label,
    titre: json.title,
    date: DateTime.fromISO(json.date),
    duree: json.duration,
    statut: json.statut,
  }
}

function jsonToBeneficiaires(jeunes: BaseJeune[]) {
  if (jeunes.length === 1) return jeunes[0].prenom + ' ' + jeunes[0].nom
  return 'Bénéficiaires multiples'
}

function jsonToHistorique(historique: Array<{ date: string; auteur: Auteur }>) {
  return historique.map(({ date, auteur }) => ({
    date,
    auteur: { nom: auteur.nom, prenom: auteur.prenom },
  }))
}
