import { Chat, Jeune, JeuneChat } from 'interfaces/jeune'

export const unJeune = (overrides: Partial<Jeune> = {}): Jeune => ({
  id: 'jeune-1',
  firstName: 'Kenji',
  lastName: 'Jirac',
  email: 'kenji.jirac@email.fr',
  isActivated: false,
  creationDate: '2021-12-07T17:30:07.756Z',
  ...overrides,
})

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
