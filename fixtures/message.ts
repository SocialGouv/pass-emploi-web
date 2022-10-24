import { DateTime } from 'luxon'

import { Message, MessagesOfADay, TypeMessage } from 'interfaces/message'
import { TypeOffre } from 'interfaces/offre'

export const unMessage = (args: Partial<Message> = {}): Message => {
  const defaults: Message = {
    id: 'idMessage',
    content: `Encrypted: content`,
    creationDate: DateTime.now(),
    sentBy: 'conseiller',
    iv: 'iv',
    conseillerId: 'conseiller-1',
    type: TypeMessage.MESSAGE,
    infoPiecesJointes: [],
    infoOffre: {
      id: '',
      titre: '',
      type: TypeOffre.EMPLOI,
    },
  }

  return { ...defaults, ...args }
}

export const desMessages = (): Message[] => [
  unMessage({
    id: 'message-1',
    content: 'Message du 22/12/2021',
    creationDate: DateTime.local(2021, 12, 22),
  }),
  unMessage({
    id: 'message-2',
    content: 'Message du 10/1/2022',
    creationDate: DateTime.local(2022, 1, 10),
    conseillerId: 'conseiller-2',
  }),
  unMessage({
    id: 'message-3',
    content: 'Message du 13/1/2022 9h',
    creationDate: DateTime.local(2022, 1, 13, 9),
    conseillerId: 'conseiller-3',
  }),
  unMessage({
    id: 'message-4',
    content: 'Message du 13/1/2022 10h',
    creationDate: DateTime.local(2022, 1, 13, 10),
  }),
  unMessage({
    id: 'message-5',
    content: 'Changement de conseiller',
    creationDate: DateTime.local(2022, 1, 14),
    type: TypeMessage.NOUVEAU_CONSEILLER,
  }),
  unMessage({
    id: 'message-6',
    content: 'Je vous partage cette offre',
    creationDate: DateTime.local(2022, 1, 15),
    type: TypeMessage.MESSAGE_OFFRE,
    infoOffre: {
      id: 'id-offre',
      titre: 'Une offre',
      type: TypeOffre.EMPLOI,
    },
  }),
  unMessage({
    id: 'message-lien-1',
    content: 'Message du 16/1/2022 avec un lien https://www.pass-emploi.com/',
    creationDate: DateTime.local(2022, 1, 16),
    conseillerId: 'conseiller-2',
  }),
]

export const desMessagesParJour = (): MessagesOfADay[] => [
  {
    date: DateTime.local(2021, 12, 22),
    messages: [
      unMessage({
        id: 'message-1',
        content: 'Decrypted: Message du 22/12/2021',
        creationDate: DateTime.local(2021, 12, 22),
      }),
    ],
  },
  {
    date: DateTime.local(2022, 1, 10),
    messages: [
      unMessage({
        id: 'message-2',
        content: 'Decrypted: Message du 10/1/2022',
        creationDate: DateTime.local(2022, 1, 10),
        conseillerId: 'conseiller-2',
      }),
    ],
  },
  {
    date: DateTime.local(2022, 1, 13, 9),
    messages: [
      unMessage({
        id: 'message-3',
        content: 'Decrypted: Message du 13/1/2022 9h',
        creationDate: DateTime.local(2022, 1, 13, 9),
        conseillerId: 'conseiller-3',
      }),
      unMessage({
        id: 'message-4',
        content: 'Decrypted: Message du 13/1/2022 10h',
        creationDate: DateTime.local(2022, 1, 13, 10),
      }),
    ],
  },
  {
    date: DateTime.local(2022, 1, 15),
    messages: [
      unMessage({
        id: 'message-6',
        content: 'Decrypted: Je vous partage cette offre',
        creationDate: DateTime.local(2022, 1, 15),
        type: TypeMessage.MESSAGE_OFFRE,
        infoOffre: {
          id: 'id-offre',
          titre: 'Une offre',
          type: TypeOffre.EMPLOI,
        },
      }),
    ],
  },
  {
    date: DateTime.local(2022, 1, 16),
    messages: [
      unMessage({
        id: 'message-lien-1',
        content:
          'Decrypted: Message du 16/1/2022 avec un lien https://www.pass-emploi.com/',
        creationDate: DateTime.local(2022, 1, 16),
        conseillerId: 'conseiller-2',
      }),
    ],
  },
]
