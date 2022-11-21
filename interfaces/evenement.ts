import { DateTime } from 'luxon'

import { BaseJeune } from 'interfaces/jeune'

export type TypeEvenement = {
  code: string
  label: string
}

export enum StatutEvenement {
  AVenir = 'AVenir',
  AClore = 'AClore',
  Close = 'Close',
}

export type AnimationCollective = {
  id: string
  type: string
  titre: string
  date: DateTime
  duree: number
  statut: StatutEvenement
}

export type EvenementListItem = {
  id: string
  beneficiaires: string
  type: string
  modality: string
  date: string
  duree: number
  idCreateur: string
}

type Auteur = { nom: string; prenom: string }
export type Modification = { date: string; auteur: Auteur }
export type Evenement = {
  id: string
  titre: string
  jeunes: BaseJeune[]
  type: TypeEvenement
  modality: string
  date: string
  duree: number
  presenceConseiller: boolean
  invitation: boolean
  createur: Auteur & { id: string }
  historique: Modification[]
  commentaire?: string
  precisionType?: string
  adresse?: string
  organisme?: string
  statut?: StatutEvenement
}

export const TYPE_EVENEMENT = {
  Autre: 'AUTRE',
  EntretienIndividuelConseiller: 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
}

export function isCodeTypeAnimationCollective(code?: string): boolean {
  return code === 'ATELIER' || code === 'INFORMATION_COLLECTIVE'
}

export enum PeriodeEvenements {
  PASSES = 'PASSES',
  FUTURS = 'FUTURS',
}

export function isStatutAClore(evenement?: Evenement) {
  return evenement?.statut === 'AClore'
}
