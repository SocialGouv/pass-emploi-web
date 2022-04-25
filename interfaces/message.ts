export enum TypeMessage {
  NOUVEAU_CONSEILLER = 'NOUVEAU_CONSEILLER',
  MESSAGE = 'MESSAGE',
}
export interface Message {
  id: string
  content: string
  creationDate: Date
  sentBy: string
  iv: string | undefined
  conseillerId: string | undefined
  type: TypeMessage
}

export interface MessagesOfADay {
  date: Date
  messages: Message[]
}
