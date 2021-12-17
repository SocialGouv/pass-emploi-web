// TODO create JsonModel
// TODO: ranger par type

import { datesAreOnSameDay } from 'utils/date'
import { Timestamp } from 'firebase/firestore'

/**
 * Firebase Models. TODO: replace in another file?
 */
export type Message = {
  id: string
  content: string
  creationDate: Timestamp
  sentBy: string
}

export class DailyMessages {
  date: Date
  messages: Message[]

  constructor(date: Date, messages: Message[]) {
    this.date = date
    this.messages = messages
  }
}

export class ListDailyMessages {
  dailyMessages: DailyMessages[]

  constructor(messages: Message[]) {
    let currentMessages: Message[] = [...messages]

    let tmpdate: Date = currentMessages[0].creationDate.toDate()
    let tmpDateMessages: DailyMessages[] = [new DailyMessages(tmpdate, [])]
    let tmpDateMessagesIndex = 0

    currentMessages.forEach((message: Message) => {
      if (datesAreOnSameDay(tmpdate, message.creationDate.toDate())) {
        tmpDateMessages[tmpDateMessagesIndex].messages.push(message)
      } else {
        tmpdate = message.creationDate.toDate()
        tmpDateMessagesIndex++
        tmpDateMessages.push(new DailyMessages(tmpdate, [message]))
      }
    })
    this.dailyMessages = tmpDateMessages
  }
}
