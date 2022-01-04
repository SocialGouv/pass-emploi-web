// TODO create JsonModel
// TODO: ranger par type

import { Timestamp } from 'firebase/firestore'

/**
 * Firebase Models. TODO: replace in another file?
 */
export interface Message {
  id: string
  content: string
  creationDate: Timestamp
  sentBy: string
  iv: string | undefined
}

export interface MessagesOfADay {
  date: Date
  messages: Message[]
}
