import { Action, StatutAction } from '../action'

type ActionStatusJson = 'not_started' | 'in_progress' | 'done' | 'canceled'
export interface ActionJson {
  id: string
  content: string
  comment: string
  creationDate: string
  lastUpdate: string
  status: ActionStatusJson
  creator: string
  creatorType: string
}

export interface ActionsCountJson {
  jeuneId: string
  todoActionsCount: number
  inProgressActionsCount: number
}

export function jsonToAction(json: ActionJson): Action {
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

function jsonToActionStatus(jsonStatus: ActionStatusJson): StatutAction {
  switch (jsonStatus) {
    case 'in_progress':
      return StatutAction.Commencee
    case 'done':
      return StatutAction.Terminee
    case 'canceled':
      return StatutAction.Annulee
    case 'not_started':
      return StatutAction.ARealiser
    default:
      console.warn(
        `Statut d'action ${jsonStatus} incorrect, traité comme ARealiser`
      )
      return StatutAction.ARealiser
  }
}

export function actionStatusToJson(status: StatutAction): ActionStatusJson {
  switch (status) {
    case StatutAction.ARealiser:
      return 'not_started'
    case StatutAction.Commencee:
      return 'in_progress'
    case StatutAction.Terminee:
      return 'done'
    case StatutAction.Annulee:
      return 'canceled'
  }
}
