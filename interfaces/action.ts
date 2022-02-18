import { compareDates } from 'utils/date'

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

export function compareActionsDatesDesc(
  action1: ActionJeune,
  action2: ActionJeune
): number {
  const compare = compareDates(
    new Date(action1.creationDate),
    new Date(action2.creationDate),
    true
  )
  return (
    compare ||
    compareDates(
      new Date(action1.lastUpdate),
      new Date(action2.lastUpdate),
      true
    )
  )
}
