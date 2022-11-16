import { DateTime } from 'luxon'

import { BaseJeune } from 'interfaces/jeune'

export type TypeEvenement = {
  code: string
  label: string
}

export type AnimationCollective = {
  id: string
  type: string
  titre: string
  date: DateTime
  duree: number
  statut: 'A_VENIR' | 'A_CLOTURER' | 'CLOTUREE'
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
  historique: Array<{ date: string; auteur: Auteur }>
  comment?: string
  precisionType?: string
  adresse?: string
  organisme?: string
}

export const TYPE_EVENEMENT = {
  Autre: 'AUTRE',
  EntretienIndividuelConseiller: 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
}

export function isCodeTypeAnimationCollective(code: string): boolean {
  return code === 'ATELIER' || code === 'INFORMATION_COLLECTIVE'
}

export enum PeriodeEvenements {
  PASSES = 'PASSES',
  FUTURS = 'FUTURS',
}
