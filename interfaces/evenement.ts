import { DateTime } from 'luxon'

import { BaseBeneficiaire } from 'interfaces/beneficiaire'

export type TypeEvenement = {
  code: string
  label: string
}

export enum StatutAnimationCollective {
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
  statut: StatutAnimationCollective
  sousTitre?: string
  isSession?: boolean
  estCache?: boolean
  nombreParticipants: number
  nombreMaxParticipants?: number
}

export type AnimationCollectivePilotage = {
  id: string
  titre: string
  date: string
  nombreInscrits: number
}

export type EvenementListItem = {
  id: string
  type: string
  date: string
  duree: number
  idCreateur?: string
  modality?: string
  labelBeneficiaires?: string
  source?: string
  futPresent?: boolean
  isSession?: boolean
}

type Auteur = { nom: string; prenom: string }
export type Modification = { date: string; auteur: Auteur }
export type Evenement = {
  id: string
  titre: string
  jeunes: Array<BaseBeneficiaire & { futPresent?: boolean }>
  type: TypeEvenement
  date: string
  duree: number
  heureDeFin: string
  presenceConseiller: boolean
  invitation: boolean
  createur: Auteur & { id: string }
  historique: Modification[]
  commentaire?: string
  modality?: string
  precisionType?: string
  adresse?: string
  organisme?: string
  statut?: StatutAnimationCollective
  source?: string
  nombreMaxParticipants?: number
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

export function estAClore(animationCollective: Evenement) {
  return animationCollective.statut === 'AClore'
}

export function estClos(animationCollective: Evenement) {
  return animationCollective.statut === 'Close'
}

export function estCreeParSiMILO(evenement: Evenement) {
  return evenement.source === 'MILO'
}
