import { DateTime } from 'luxon'

import { BaseJeune } from 'interfaces/jeune'

export interface TypeEvenement {
  code: string
  label: string
}

export interface AnimationCollective {
  id: string
  type: string
  titre: string
  date: DateTime
  duree: number
  statut: 'A_VENIR' | 'A_CLOTURER' | 'CLOTUREE'
}

export interface EvenementListItem {
  id: string
  beneficiaires: string
  type: string
  modality: string
  date: string
  duree: number
  idCreateur?: string
}

export interface Evenement {
  id: string
  titre: string
  jeunes: BaseJeune[]
  type: TypeEvenement
  precisionType: string
  modality: string
  date: string
  duree: number
  adresse: string
  organisme: string
  presenceConseiller: boolean
  invitation: boolean
  comment: string
  createur: { id: string; nom: string; prenom: string } | null
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
