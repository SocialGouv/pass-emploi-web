export interface ActionJeune {
  id: string
  content: string
  comment: string
  creationDate: string
  lastUpdate: string
  creator: string
  creatorType: string
  status: ActionStatus
}

// FIXME : bonne pratique des enum > clé === valeur
export enum ActionStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Done = 'done',
}
