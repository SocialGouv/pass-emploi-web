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
}

export interface MetadonneesActions {
  nombrePages: number
  nombreTotal: number
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
