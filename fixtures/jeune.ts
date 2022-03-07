import {
  Chat,
  Jeune,
  JeuneAvecNbActionsNonTerminees,
  JeuneChat,
} from 'interfaces/jeune'

export const unJeune = (overrides: Partial<Jeune> = {}): Jeune => {
  const defaults: Jeune = {
    id: 'jeune-1',
    firstName: 'Kenji',
    lastName: 'Jirac',
    email: 'kenji.jirac@email.fr',
    isActivated: false,
    creationDate: '2021-12-07T17:30:07.756Z',
    lastActivity: '2021-12-07T17:30:07.756Z',
    conseillerPrecedent: {
      prenom: 'Nils',
      nom: 'Tavernier',
      email: 'conseiller@email.com',
    },
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

export const unJeuneAvecActionsNonTerminees = (
  overrides: Partial<JeuneAvecNbActionsNonTerminees> = {}
): JeuneAvecNbActionsNonTerminees => {
  const defaults: JeuneAvecNbActionsNonTerminees = {
    ...unJeune(),
    nbActionsNonTerminees: 5,
  }
  return { ...defaults, ...overrides }
}

export const desJeunesAvecActionsNonTerminees =
  (): JeuneAvecNbActionsNonTerminees[] => [
    unJeuneAvecActionsNonTerminees(),
    unJeuneAvecActionsNonTerminees({
      id: 'jeune-2',
      firstName: 'Nadia',
      lastName: 'Sanfamiye',
      email: 'nadia.sanfamiye@mail.com',
      creationDate: '2022-01-07T17:30:07.756Z',
      lastActivity: '2022-01-30T17:30:07.756Z',
      nbActionsNonTerminees: 0,
    }),
    unJeuneAvecActionsNonTerminees({
      id: 'jeune-3',
      firstName: 'Maria',
      lastName: "D'Aböville-Muñoz François",
      email: 'nadia.sanfamiye@mail.com',
      creationDate: '2021-12-28T17:30:07.756Z',
      lastActivity: '2022-02-07T17:30:07.756Z',
      nbActionsNonTerminees: 8,
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
