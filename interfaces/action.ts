import { DateTime } from 'luxon'

import { UserType } from 'interfaces/conseiller'
import { compareDates, compareDatesDesc } from 'utils/date'

export interface Action {
  id: string
  titre: string
  comment: string
  creationDate: string
  lastUpdate: string
  creator: string
  creatorType: string
  status: StatutAction
  dateEcheance: string
  dateFinReelle?: string
  qualification?: QualificationAction
  beneficiaire: {
    id: string
    prenom: string
    nom: string
    dispositif: string
    idConseiller: string
  }
}

export interface ActionPilotage {
  id: string
  titre: string
  beneficiaire: {
    id: string
    nom: string
    prenom: string
  }
  dateFinReelle: string
  categorie?: {
    code: string
    libelle: string
  }
}

export interface ActionAQualifier {
  idAction: string
  codeQualification?: string
}

export interface QualificationAction {
  libelle: string
  code: string
  isSituationNonProfessionnelle: boolean
}

export interface CompteursBeneficiairePeriode {
  idBeneficiaire: string
  actionsCreees: number
  rdvs: number
}

export enum StatutAction {
  AFaire = 'AFaire',
  Terminee = 'Terminee',
  TermineeAQualifier = 'TermineeAQualifier',
  TermineeQualifiee = 'TermineeQualifiee',
  Annulee = 'Annulee',
}

export type SituationNonProfessionnelle = { code: string; label: string }

export type ActionPredefinie = {
  id: string
  titre: string
}

export function estTermine(statut: Action['status']): boolean {
  return (
    statut === StatutAction.Terminee ||
    statut === StatutAction.TermineeAQualifier ||
    statut === StatutAction.TermineeQualifiee
  )
}

export function estSupprimable({
  creatorType,
  status,
}: Pick<Action, 'creatorType' | 'status'>): boolean {
  return (
    creatorType === UserType.CONSEILLER.toLowerCase() && !estTermine(status)
  )
}

export function comparerParDateEcheance(
  action1: Action,
  action2: Action,
  antechronologique: boolean
): number {
  const compareDateEcheance = antechronologique
    ? compareDatesDesc
    : compareDates
  const comparaisonDateEcheance = compareDateEcheance(
    DateTime.fromISO(action1.dateEcheance),
    DateTime.fromISO(action2.dateEcheance)
  )

  return (
    comparaisonDateEcheance ||
    compareDates(
      DateTime.fromISO(action1.creationDate),
      DateTime.fromISO(action2.creationDate)
    )
  )
}
