import { DateTime } from 'luxon'

import { UserType } from 'interfaces/conseiller'
import { compareDates, compareDatesDesc } from 'utils/date'

export interface Action {
  id: string
  titre: string
  comment: string
  dateCreation: string
  dateDerniereActualisation: string
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
  description: string
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

export function comparerParDate(
  action1: Action,
  action2: Action,
  antechronologique: boolean
): number {
  const compareDate = antechronologique ? compareDatesDesc : compareDates

  const comparaisonDate = compareDate(
    getDateReferenceAction(action1),
    getDateReferenceAction(action2)
  )

  return (
    comparaisonDate ||
    compareDates(
      DateTime.fromISO(action1.dateCreation),
      DateTime.fromISO(action2.dateCreation)
    )
  )
}

export function getDateReferenceAction(action: Action): DateTime {
  const date =
    action.status === StatutAction.Annulee ||
    action.status === StatutAction.AFaire
      ? action.dateEcheance
      : action.dateFinReelle
  return DateTime.fromISO(date!)
}
