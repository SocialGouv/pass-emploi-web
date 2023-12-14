export interface Action {
  id: string
  content: string
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
}

export interface QualificationAction {
  libelle: string
  isSituationNonProfessionnelle: boolean
  estQualifiee: boolean
}

export interface TotalActions {
  idJeune: string
  nbActionsNonTerminees: number
}

export enum StatutAction {
  ARealiser = 'ARealiser',
  Commencee = 'Commencee',
  Terminee = 'Terminee',
  Annulee = 'Annulee',
}

export enum EtatQualificationAction {
  NonQualifiable = 'NonQualifiable',
  AQualifier = 'AQualifier',
  Qualifiee = 'Qualifiee',
}

export interface Commentaire {
  id: string
  idAction: string
  date: string
  createur: CreateurCommentaire
  message: string
}

export interface CreateurCommentaire {
  prenom: string
  nom: string
  id: string
  type: 'conseiller' | 'jeune'
}

export type SituationNonProfessionnelle = { code: string; label: string }

export type ActionPredefinie = {
  id: string
  titre: string
}
