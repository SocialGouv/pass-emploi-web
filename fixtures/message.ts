import { Message, MessagesOfADay, TypeMessage } from 'interfaces/message'

export const unMessage = (args: Partial<Message> = {}): Message => {
  const defaults: Message = {
    id: 'idMessage',
    content: `Encrypted: content`,
    creationDate: new Date(),
    sentBy: 'conseiller',
    iv: 'iv',
    conseillerId: 'conseiller-1',
    type: TypeMessage.MESSAGE,
  }

  return { ...defaults, ...args }
}

export const desMessages = (): Message[] => [
  unMessage({
    id: 'message-1',
    content: 'Message du 22/12/2021',
    creationDate: new Date(2021, 11, 22),
  }),
  unMessage({
    id: 'message-2',
    content: 'Message du 10/1/2022',
    creationDate: new Date(2022, 0, 10),
    conseillerId: 'conseiller-2',
  }),
  unMessage({
    id: 'message-3',
    content: 'Message du 13/1/2022 9h',
    creationDate: new Date(2022, 0, 13, 9),
    conseillerId: 'conseiller-3',
  }),
  unMessage({
    id: 'message-4',
    content: 'Message du 13/1/2022 10h',
    creationDate: new Date(2022, 0, 13, 10),
  }),
  unMessage({
    id: 'message-5',
    content: 'Changement de conseiller',
    creationDate: new Date(2022, 0, 14),
    type: TypeMessage.NOUVEAU_CONSEILLER,
  }),
]

export const desMessagesParJour = (): MessagesOfADay[] => [
  {
    date: new Date(2021, 11, 22),
    messages: [
      unMessage({
        id: 'message-1',
        content: 'Decrypted: Message du 22/12/2021',
        creationDate: new Date(2021, 11, 22),
      }),
    ],
  },
  {
    date: new Date(2022, 0, 10),
    messages: [
      unMessage({
        id: 'message-2',
        content: 'Decrypted: Message du 10/1/2022',
        creationDate: new Date(2022, 0, 10),
        conseillerId: 'conseiller-2',
      }),
    ],
  },
  {
    date: new Date(2022, 0, 13, 9),
    messages: [
      unMessage({
        id: 'message-3',
        content: 'Decrypted: Message du 13/1/2022 9h',
        creationDate: new Date(2022, 0, 13, 9),
        conseillerId: 'conseiller-3',
      }),
      unMessage({
        id: 'message-4',
        content: 'Decrypted: Message du 13/1/2022 10h',
        creationDate: new Date(2022, 0, 13, 10),
      }),
    ],
  },
]
