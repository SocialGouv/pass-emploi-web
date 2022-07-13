import {
  BaseJeune,
  CategorieSituation,
  Chat,
  ConseillerHistorique,
  DetailJeune,
  JeuneAvecNbActionsNonTerminees,
  JeuneChat,
  JeuneFromListe,
} from 'interfaces/jeune'
import { ConseillerHistoriqueJson } from 'interfaces/json/conseiller'
import { DetailJeuneJson, ItemJeuneJson } from 'interfaces/json/jeune'

export const uneBaseJeune = (overrides: Partial<BaseJeune> = {}): BaseJeune => {
  const defaults: BaseJeune = {
    id: 'jeune-1',
    prenom: 'Kenji',
    nom: 'Jirac',
  }
  return { ...defaults, ...overrides }
}

export const unDetailJeune = (
  overrides: Partial<DetailJeune> = {}
): DetailJeune => {
  const defaults: DetailJeune = {
    ...uneBaseJeune(),
    email: 'kenji.jirac@email.fr',
    isActivated: true,
    isReaffectationTemporaire: false,
    creationDate: '2021-12-07T17:30:07.756Z',
    situations: [],
  }
  return { ...defaults, ...overrides }
}

export const unItemJeune = (
  overrides: Partial<JeuneFromListe> = {}
): JeuneFromListe => {
  const defaults: JeuneFromListe = {
    ...uneBaseJeune(),
    isActivated: true,
    isReaffectationTemporaire: false,
    lastActivity: '2021-12-07T17:30:07.756Z',
    situationCourante: CategorieSituation.SANS_SITUATION,
  }
  return { ...defaults, ...overrides }
}

export const desItemsJeunes = (): JeuneFromListe[] => [
  unItemJeune(),
  unItemJeune({
    id: 'jeune-2',
    prenom: 'Nadia',
    nom: 'Sanfamiye',
    lastActivity: '2022-01-30T17:30:07.756Z',
    isActivated: true,
  }),
  unItemJeune({
    id: 'jeune-3',
    prenom: 'Maria',
    nom: "D'Aböville-Muñoz François",
    lastActivity: '2022-02-07T17:30:07.756Z',
    isActivated: true,
  }),
]

export const unDetailJeuneJson = (
  overrides: Partial<DetailJeuneJson> = {}
): DetailJeuneJson => {
  const defaults: DetailJeuneJson = {
    id: 'jeune-1',
    firstName: 'Kenji',
    lastName: 'Jirac',
    email: 'kenji.jirac@email.fr',
    isActivated: true,
    isReaffectationTemporaire: false,
    creationDate: '2021-12-07T17:30:07.756Z',
  }
  return { ...defaults, ...overrides }
}

export const unItemJeuneJson = (
  overrides: Partial<ItemJeuneJson> = {}
): ItemJeuneJson => {
  const defaults: ItemJeuneJson = {
    id: 'jeune-1',
    firstName: 'Kenji',
    lastName: 'Jirac',
    isActivated: true,
    isReaffectationTemporaire: false,
    lastActivity: '2021-12-07T17:30:07.756Z',
  }
  return { ...defaults, ...overrides }
}

export const desItemsJeunesJson = (): ItemJeuneJson[] => [
  unItemJeuneJson(),
  unItemJeuneJson({
    id: 'jeune-2',
    firstName: 'Nadia',
    lastName: 'Sanfamiye',
    lastActivity: '2022-01-30T17:30:07.756Z',
    isActivated: true,
  }),
  unItemJeuneJson({
    id: 'jeune-3',
    firstName: 'Maria',
    lastName: "D'Aböville-Muñoz François",
    lastActivity: '2022-02-07T17:30:07.756Z',
    isActivated: true,
  }),
]

export const unJeuneAvecActionsNonTerminees = (
  overrides: Partial<JeuneAvecNbActionsNonTerminees> = {}
): JeuneAvecNbActionsNonTerminees => {
  const defaults: JeuneAvecNbActionsNonTerminees = {
    ...unItemJeune(),
    nbActionsNonTerminees: 5,
  }
  return { ...defaults, ...overrides }
}

export const desJeunesAvecActionsNonTerminees =
  (): JeuneAvecNbActionsNonTerminees[] => [
    unJeuneAvecActionsNonTerminees(),
    unJeuneAvecActionsNonTerminees({
      id: 'jeune-2',
      prenom: 'Nadia',
      nom: 'Sanfamiye',
      isActivated: false,
      lastActivity: '2022-01-30T17:30:07.756Z',
      nbActionsNonTerminees: 0,
    }),
    unJeuneAvecActionsNonTerminees({
      id: 'jeune-3',
      prenom: 'Maria',
      nom: "D'Aböville-Muñoz François",
      lastActivity: '2022-02-07T17:30:07.756Z',
      isReaffectationTemporaire: true,
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
    flaggedByConseiller: true,
  }
  return { ...defaults, ...overrides }
}

export const unJeuneChat = (overrides: Partial<JeuneChat> = {}): JeuneChat => {
  const defaults: JeuneChat = {
    id: 'jeune-1',
    prenom: 'Kenji',
    nom: 'Jirac',
    isActivated: true,
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
    depuis: '12/03/2022',
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
    depuis: '2021-12-28T17:30:07.756Z',
  }),
  unConseillerHistorique({
    id: 'conseiller-3',
    email: 'conseiller-3@mail.fr',
    nom: 'Hazard',
    prenom: 'Maurice',
    depuis: '2021-12-14T17:30:07.756Z',
  }),
  unConseillerHistorique({
    id: 'conseiller-4',
    email: 'conseiller-4@mail.fr',
    nom: 'Sall',
    prenom: 'Ahmadi',
    depuis: '2021-02-16T17:30:07.756Z',
  }),
  unConseillerHistorique({
    id: 'conseiller-5',
    email: 'conseiller-5@mail.fr',
    nom: 'Wonder',
    prenom: 'Mia',
    depuis: '2020-06-06T17:30:07.756Z',
  }),
  unConseillerHistorique({
    id: 'conseiller-6',
    email: 'conseiller-6@mail.fr',
    nom: 'Lupin',
    prenom: 'Edgard',
    depuis: '2020-02-02T17:30:07.756Z',
  }),
]

export const desConseillersJeuneJson = (): ConseillerHistoriqueJson[] => {
  return desConseillersJeune().map((conseiller) => ({
    id: conseiller.id,
    email: conseiller.email,
    nom: conseiller.nom,
    prenom: conseiller.prenom,
    date: conseiller.depuis,
  }))
}

export function extractBaseJeune(base: BaseJeune): BaseJeune {
  return { id: base.id, nom: base.nom, prenom: base.prenom }
}
