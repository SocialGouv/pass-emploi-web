import { ActionStatus } from 'interfaces/action'

export type ActionJeuneJson = {
  id: string
  content: string
  comment: string
  creationDate: string
  lastUpdate: string
  status: ActionStatus
  creator: string
  creatorType: string
}
