import { DateTime } from 'luxon'

import { EntreeAgenda } from 'interfaces/agenda'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  AnimationCollective,
  Evenement,
  EvenementListItem,
  StatutAnimationCollective,
  TypeEvenement,
} from 'interfaces/evenement'
import { BaseJeune } from 'interfaces/jeune'
import { TIME_24_H_SEPARATOR, toFrenchFormat } from 'utils/date'

type Auteur = { id: string; nom: string; prenom: string }

export type EvenementJson = {
  id: string
  date: string
  duration: number
  type: TypeEvenement
  jeunes: Array<BaseJeune & { futPresent?: boolean }>
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
  statut?: StatutAnimationCollectiveJson
  source?: StructureConseiller
  futPresent?: boolean
}

export type EvenementJeuneJson = Omit<EvenementJson, 'jeunes'>

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
    duree: json.duration,
    titre: json.title,
    presenceConseiller: Boolean(json.presenceConseiller),
    invitation: Boolean(json.invitation),
    historique: [],
    source: json.source,
    futPresent: Boolean(json.futPresent),
  }
  if (json.modality) evenement.modality = json.modality
  if (json.comment) evenement.commentaire = json.comment
  if (json.precision) evenement.precisionType = json.precision
  if (json.adresse) evenement.adresse = json.adresse
  if (json.organisme) evenement.organisme = json.organisme
  if (json.historique) evenement.historique = jsonToHistorique(json.historique)
  if (json.statut)
    evenement.statut = jsonToStatutAnimationCollective(json.statut)
  if (json.source) evenement.source = json.source
  if (json.futPresent) evenement.futPresent = json.futPresent

  return evenement
}

export function jsonToListItem(
  json: EvenementJson | EvenementJeuneJson
): EvenementListItem {
  const evenement: EvenementListItem = {
    id: json.id,
    type: json.type.label,
    date: json.date,
    duree: json.duration,
    idCreateur: json.createur.id,
    source: json.source,
    futPresent: Boolean(json.futPresent),
  }
  if (json.modality) evenement.modality = json.modality
  if (Object.prototype.hasOwnProperty.call(json, 'jeunes')) {
    evenement.labelBeneficiaires = jsonToBeneficiaires(
      (json as EvenementJson).jeunes
    )
  }

  return evenement
}

export function rdvJsonToEntree(rdv: EvenementJeuneJson): EntreeAgenda {
  const date = DateTime.fromISO(rdv.date)
  const titre = `${toFrenchFormat(date, TIME_24_H_SEPARATOR)} - ${rdv.title}`

  return {
    id: rdv.id,
    date: date,
    type: 'evenement',
    titre,
    source: rdv.source,
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

function jsonToBeneficiaires(jeunes: BaseJeune[]): string | undefined {
  if (jeunes.length === 1) return jeunes[0].prenom + ' ' + jeunes[0].nom
  return 'Bénéficiaires multiples'
}

function jsonToHistorique(historique: Array<{ date: string; auteur: Auteur }>) {
  return historique.map(({ date, auteur }) => ({
    date,
    auteur: { nom: auteur.nom, prenom: auteur.prenom },
  }))
}
