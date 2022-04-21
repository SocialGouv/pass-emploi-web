import { compareDatesDesc } from 'utils/date'

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

export interface ActionsCount {
  jeuneId: string
  jeuneFirstName: string
  jeuneLastName: string
  todoActionsCount: number
  doneActionsCount: number
  inProgressActionsCount: number
}

export enum ActionStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Done = 'Done',
  Canceled = 'Canceled',
}

export function compareActionsDatesDesc(
  action1: ActionJeune,
  action2: ActionJeune
): number {
  const compare = compareDatesDesc(
    new Date(action1.creationDate),
    new Date(action2.creationDate)
  )
  return (
    compare ||
    compareDatesDesc(new Date(action1.lastUpdate), new Date(action2.lastUpdate))
  )
}
