import {
  Chat,
  ConseillerHistorique,
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
    isActivated: true,
  }),
  unJeune({
    id: 'jeune-3',
    firstName: 'Maria',
    lastName: "D'Aböville-Muñoz François",
    email: 'nadia.sanfamiye@mail.com',
    creationDate: '2021-12-28T17:30:07.756Z',
    lastActivity: '2022-02-07T17:30:07.756Z',
    isActivated: true,
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
      isActivated: true,
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
      isActivated: true,
      nbActionsNonTerminees: 8,
    }),
  ]

export const unChat = (overrides: Partial<Chat> = {}): Chat => {
  const defaults: Chat = {
    chatId: 'chat-id',
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

export const unConseillerHistorique = (
  overrides: Partial<ConseillerHistorique> = {}
): ConseillerHistorique => {
  const defaults: ConseillerHistorique = {
    id: 'conseiller-1',
    email: 'mail@mail.com',
    nom: 'Dublon',
    prenom: 'Nicolas',
    date: '12/03/2022',
  }
  return { ...defaults, ...overrides }
}

export const desConseillersJeune = (): ConseillerHistorique[] => [
  unConseillerHistorique(),
  unConseillerHistorique({
    id: 'conseiller-2',
    email: 'conseiller@mail.fr',
    nom: 'Maravillo',
    prenom: 'Sarah',
    date: '14/12/2021',
  }),
  unConseillerHistorique({
    id: 'conseiller-3',
    email: 'conseiller-3@mail.fr',
    nom: 'Hazard',
    prenom: 'Maurice',
    date: '23/04/2021',
  }),
  unConseillerHistorique({
    id: 'conseiller-4',
    email: 'conseiller-4@mail.fr',
    nom: 'Sall',
    prenom: 'Ahmadi',
    date: '03/03/2021',
  }),
  unConseillerHistorique({
    id: 'conseiller-5',
    email: 'conseiller-5@mail.fr',
    nom: 'Wonder',
    prenom: 'Mia',
    date: '06/07/2020',
  }),
  unConseillerHistorique({
    id: 'conseiller-6',
    email: 'conseiller-6@mail.fr',
    nom: 'Lupin',
    prenom: 'Edgard',
    date: '02/05/2021',
  }),
]

//TODO: supprimer quand back dispo
export const conseillersPrecedents = [
  {
    id: 'conseiller-1',
    email: 'mail@mail.com',
    nom: 'Dublon',
    prenom: 'Nicolas',
    date: '12/03/2022',
  },
  {
    id: 'conseiller-2',
    email: 'conseiller@mail.fr',
    nom: 'Maravillo',
    prenom: 'Sarah',
    date: '14/12/2021',
  },
  {
    id: 'conseiller-3',
    email: 'maravillo@mail.fr',
    nom: 'Humbert',
    prenom: 'Mélodie',
    date: '18/01/2020',
  },
  {
    id: 'conseiller-4',
    email: 'mail@mail.com',
    nom: 'Dublon',
    prenom: 'Nicolas',
    date: '12/03/2022',
  },
  {
    id: 'conseiller-5',
    email: 'conseiller@mail.fr',
    nom: 'Maravillo',
    prenom: 'Sarah',
    date: '14/12/2021',
  },
  {
    id: 'conseiller-6',
    email: 'maravillo@mail.fr',
    nom: 'Humbert',
    prenom: 'Mélodie',
    date: '18/01/2020',
  },
]
