import { ActionJeune, ActionStatus } from '../action'

export type ActionJeuneJson = {
  id: string
  content: string
  comment: string
  creationDate: string
  lastUpdate: string
  status: 'not_started' | 'in_progress' | 'done'
  creator: string
  creatorType: string
}

export function jsonToActionJeune(json: ActionJeuneJson): ActionJeune {
  return {
    id: json.id,
    content: json.content,
    comment: json.comment,
    creationDate: new Date(json.creationDate).toISOString(),
    lastUpdate: new Date(json.lastUpdate).toISOString(),
    status: jsonToActionStatus(json.status),
    creator: json.creator,
    creatorType: json.creatorType,
  }
}

function jsonToActionStatus(jsonStatus: string): ActionStatus {
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
