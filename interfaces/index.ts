export interface Message {
  id: string
  content: string
  creationDate: Date
  sentBy: string
  iv: string | undefined
  conseillerId?: string
}

export interface MessagesOfADay {
  date: Date
  messages: Message[]
}
