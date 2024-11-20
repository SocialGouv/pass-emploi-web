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
  Qualifiee = 'Qualifiee',
  Annulee = 'Annulee',
}

export type SituationNonProfessionnelle = { code: string; label: string }

export type ActionPredefinie = {
  id: string
  titre: string
}
