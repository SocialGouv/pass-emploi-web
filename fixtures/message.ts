import { DateTime } from 'luxon'

import {
  Message,
  MessageListeDiffusion,
  ByDay,
  TypeMessage,
} from 'interfaces/message'
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

export const desMessagesAntechronologiques = (): Message[] => [
  unMessage({
    id: 'message-7',
    content: 'Je vous partage cet événement',
    creationDate: DateTime.local(2022, 1, 17),
    type: TypeMessage.MESSAGE_EVENEMENT,
    infoEvenement: {
      id: 'id-evenement',
      titre: 'Un atelier',
      date: DateTime.fromISO('2021-12-22T00:00:00.000Z'),
    },
  }),
  unMessage({
    id: 'message-lien-1',
    content: 'Message du 16/1/2022 avec un lien https://www.pass-emploi.com/',
    creationDate: DateTime.local(2022, 1, 16),
    conseillerId: 'conseiller-2',
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
    id: 'message-5',
    content: 'Changement de conseiller',
    creationDate: DateTime.local(2022, 1, 14),
    type: TypeMessage.NOUVEAU_CONSEILLER,
  }),
  unMessage({
    id: 'message-4',
    content: 'Message du 13/1/2022 10h',
    creationDate: DateTime.local(2022, 1, 13, 10),
  }),
  unMessage({
    id: 'message-3',
    content: 'Message du 13/1/2022 9h',
    creationDate: DateTime.local(2022, 1, 13, 9),
    conseillerId: 'conseiller-3',
  }),
  unMessage({
    id: 'message-2',
    content: 'Message du 10/1/2022',
    creationDate: DateTime.local(2022, 1, 10),
    conseillerId: 'conseiller-2',
  }),
  unMessage({
    id: 'message-1',
    content: 'Message du 22/12/2021',
    creationDate: DateTime.local(2021, 12, 22),
  }),
]

export const desMessagesParJour = (): ByDay<Message>[] => [
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
  {
    date: DateTime.local(2022, 1, 17),
    messages: [
      unMessage({
        id: 'message-7',
        content: 'Decrypted: Je vous partage cet événement',
        creationDate: DateTime.local(2022, 1, 17),
        type: TypeMessage.MESSAGE_EVENEMENT,
        infoEvenement: {
          id: 'id-evenement',
          titre: 'Un atelier',
          date: DateTime.fromISO('2021-12-22T00:00:00.000Z'),
        },
      }),
    ],
  },
]

export const unMessageListeDiffusion = (
  args: Partial<MessageListeDiffusion> = {}
): MessageListeDiffusion => {
  const defaults: MessageListeDiffusion = {
    id: 'idMessage',
    content: `Encrypted: content`,
    creationDate: DateTime.now(),
    iv: 'iv',
    type: TypeMessage.MESSAGE,
    infoPiecesJointes: [],
  }

  return { ...defaults, ...args }
}

export function desMessagesListeDiffusion(): MessageListeDiffusion[] {
  return [
    unMessageListeDiffusion({
      id: 'message-1',
      content: 'Message du 22/12/2021',
      creationDate: DateTime.local(2021, 12, 22),
    }),
    unMessageListeDiffusion({
      id: 'message-2',
      content: 'Message du 10/1/2022',
      creationDate: DateTime.local(2022, 1, 10),
    }),
    unMessageListeDiffusion({
      id: 'message-3',
      content: 'Message du 13/1/2022 9h',
      creationDate: DateTime.local(2022, 1, 13, 9),
    }),
    unMessageListeDiffusion({
      id: 'message-4',
      content: 'Message du 13/1/2022 10h',
      creationDate: DateTime.local(2022, 1, 13, 10),
    }),
  ]
}

export const desMessagesListeDeDiffusionParJour =
  (): ByDay<MessageListeDiffusion>[] => [
    {
      date: DateTime.local(2021, 12, 22),
      messages: [
        unMessageListeDiffusion({
          id: 'message-1',
          content: 'Decrypted: Message du 22/12/2021',
          creationDate: DateTime.local(2021, 12, 22),
        }),
      ],
    },
    {
      date: DateTime.local(2022, 1, 10),
      messages: [
        unMessageListeDiffusion({
          id: 'message-2',
          content: 'Decrypted: Message du 10/1/2022',
          creationDate: DateTime.local(2022, 1, 10),
        }),
      ],
    },
    {
      date: DateTime.local(2022, 1, 13, 9),
      messages: [
        unMessageListeDiffusion({
          id: 'message-3',
          content: 'Decrypted: Message du 13/1/2022 9h',
          creationDate: DateTime.local(2022, 1, 13, 9),
        }),
        unMessageListeDiffusion({
          id: 'message-4',
          content: 'Decrypted: Message du 13/1/2022 10h',
          creationDate: DateTime.local(2022, 1, 13, 10),
        }),
      ],
    },
  ]
