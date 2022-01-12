export interface Message {
  id: string
  content: string
  creationDate: Date
  sentBy: string
  iv: string | undefined
}

export interface MessagesOfADay {
  date: Date
  messages: Message[]
}
