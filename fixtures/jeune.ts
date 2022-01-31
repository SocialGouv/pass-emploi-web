import { Chat, Jeune, JeuneChat } from 'interfaces/jeune'

export const unJeune = (overrides: Partial<Jeune> = {}): Jeune => {
  const defaults: Jeune = {
    id: 'jeune-1',
    firstName: 'Kenji',
    lastName: 'Jirac',
    email: 'kenji.jirac@email.fr',
    isActivated: false,
    creationDate: '2021-12-07T17:30:07.756Z',
    lastActivity: '2021-12-07T17:30:07.756Z',
  }
  return { ...defaults, ...overrides }
}

export const desJeunes = (): Jeune[] => [
  unJeune(),
  unJeune({
    id: 'jeune-2',
    firstName: 'Nadia',
    lastName: 'Sanfamiye',
    email: 'nadia.sanfamiye@mail.com',
    creationDate: '2022-01-07T17:30:07.756Z',
    lastActivity: '2022-01-30T17:30:07.756Z',
  }),
  unJeune({
    id: 'jeune-3',
    firstName: 'Maria',
    lastName: "D'Aböville-Muñoz François",
    email: 'nadia.sanfamiye@mail.com',
    creationDate: '2021-12-28T17:30:07.756Z',
    lastActivity: '2022-02-07T17:30:07.756Z',
  }),
]

export const unChat = (overrides: Partial<Chat> = {}): Chat => {
  const defaults: Chat = {
    seenByConseiller: true,
    newConseillerMessageCount: 1,
    lastMessageContent: 'Test message',
    lastMessageSentAt: new Date(),
    lastMessageSentBy: 'conseiller',
    lastConseillerReading: new Date(),
    lastJeuneReading: undefined,
    lastMessageIv: undefined,
  }
  return { ...defaults, ...overrides }
}

export const unJeuneChat = (overrides: Partial<JeuneChat> = {}): JeuneChat => {
  const defaults: JeuneChat = {
    ...unJeune(),
    ...unChat(),
    chatId: 'idChat',
  }
  return { ...defaults, ...overrides }
}
