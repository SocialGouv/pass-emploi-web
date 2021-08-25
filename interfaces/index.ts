// TODO create JsonModel

export type UserAction = {
  id: string
  content: string
  comment: string
  isDone: boolean
  creationDate: Date
  lastUpdate: Date
}

export type Jeune = {
  id: string
  firstName: string
  lastName: string
  chatId?: string
}