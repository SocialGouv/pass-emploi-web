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
}

export function jsonToActionStatus(jsonStatus: string): ActionStatus {
  switch (jsonStatus) {
    case 'in_progress':
      return ActionStatus.InProgress
    case 'done':
      return ActionStatus.Done
    case 'not_started':
      return ActionStatus.NotStarted
    default:
      console.warn(
        `Statut d'action ${jsonStatus} incorrect, traité comme NotStarted`
      )
      return ActionStatus.NotStarted
  }
}

export function actionStatusToJson(status: ActionStatus): string {
  switch (status) {
    case ActionStatus.NotStarted:
      return 'not_started'
    case ActionStatus.InProgress:
      return 'in_progress'
    case ActionStatus.Done:
      return 'done'
  }
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
