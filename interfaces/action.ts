import { Jeune } from "interfaces";

export type JeuneActions = {
  jeune: Jeune,
  nbActionsEnCours: number
  nbActionsTerminees: number,
}

export type UserAction = {
  id: string
  content: string
  comment: string
  creationDate: Date
  lastUpdate: Date
  creator:string
  isDone?: boolean
  status: ActionStatus
}

export enum ActionStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Done = 'done',
}