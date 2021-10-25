import { ActionStatus } from "interfaces/action"

export type JeuneActionJson = {
  jeuneId: string,
  jeuneFirstName: string,
  jeuneLastName: string,
  todoActionsCount: number,
  doneActionsCount: number,
}

export type UserActionJson = {
  id: string
  content: string
  comment: string
  creationDate: Date
  lastUpdate: Date
  isDone?: boolean
  status?: ActionStatus
  creator:string
}