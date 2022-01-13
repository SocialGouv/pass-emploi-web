import { Message } from 'interfaces'

export const unMessage = (args: Partial<Message> = {}): Message => {
  const defaults: Message = {
    id: 'idMessage',
    content: `Encrypted: content`,
    creationDate: new Date(),
    sentBy: 'conseiller',
    iv: 'iv',
  }

  return { ...defaults, ...args }
}

export const desMessages = (): Message[] => [
  unMessage({
    content: 'Message du 22/12/2021',
    creationDate: new Date(2021, 11, 22),
  }),
  unMessage({
    content: 'Message du 10/1/2022',
    creationDate: new Date(2022, 0, 10),
  }),
  unMessage({
    content: 'Message du 13/1/2022 9h',
    creationDate: new Date(2022, 0, 13, 9),
  }),
  unMessage({
    content: 'Message du 13/1/2022 10h',
    creationDate: new Date(2022, 0, 13, 10),
  }),
]
