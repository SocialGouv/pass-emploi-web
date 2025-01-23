import { UserType } from 'interfaces/conseiller'

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

export interface CompteurActionsPeriode {
  idBeneficiaire: string
  actions: number
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
