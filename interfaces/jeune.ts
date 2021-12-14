import { Timestamp } from 'firebase/firestore'

export type Jeune = {
  id: string
  firstName: string
  lastName: string
  chatId?: string
}

export interface JeuneChat extends Jeune {
  seenByConseiller: boolean
  newConseillerMessageCount: number
  lastMessageContent: string | undefined
  lastMessageSentAt: Timestamp | undefined
  lastMessageSentBy: string | undefined
  lastConseillerReading: Timestamp | undefined
  lastJeuneReading: Timestamp | undefined
}
