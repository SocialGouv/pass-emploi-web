import { ActionStatus } from 'interfaces/action'

export type JeuneActionsJson = {
  jeuneId: string,
  jeuneFirstName: string,
  jeuneLastName: string,
  todoActionsCount: number,
  doneActionsCount: number,
  inProgressActionsCount: number
}

export type ActionJeuneJson = {
  id: string
  content: string
  comment: string
  creationDate: Date
  lastUpdate: Date
  isDone?: boolean
  status?: ActionStatus
  creator: string
  creatorType: string
}
