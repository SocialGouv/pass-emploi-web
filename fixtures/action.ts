import {
  Action,
  Commentaire,
  MetadonneesActions,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import { ActionJson } from 'interfaces/json/action'

export const uneAction = (overrides: Partial<Action> = {}): Action => {
  const defaults: Action = {
    id: 'id-action-1',
    content: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: '2022-02-15T15:50:46.000+01:00',
    lastUpdate: '2022-02-16T15:50:46.000+01:00',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: StatutAction.ARealiser,
    dateEcheance: '2022-02-20T14:50:46.000Z',
  }

  return { ...defaults, ...overrides }
}

export const uneListeDActions = (): Action[] => [
  uneAction(),
  {
    id: 'id-action-2',
    content: 'Compléter son cv',
    comment: 'Je suis un beau commentaire',
    creationDate: '2022-02-17T15:50:46.000+01:00',
    lastUpdate: '2022-02-18T15:50:46.000+01:00',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: StatutAction.Commencee,
    dateEcheance: '2022-02-20T14:50:46.000Z',
  },
  {
    id: 'id-action-3',
    content: 'Chercher une formation',
    comment: 'Je suis un beau commentaire',
    creationDate: '2022-02-19T15:50:46.000+01:00',
    lastUpdate: '2022-02-20T15:50:46.000+01:00',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: StatutAction.Terminee,
    dateEcheance: '2022-02-21T14:50:46.000Z',
    dateFinReelle: '2022-02-20T14:50:46.000Z',
  },
  {
    id: 'id-action-4',
    content: "Consulter les offres d'emploi",
    comment: 'Je suis un beau commentaire',
    creationDate: '2022-02-21T15:50:46.000+01:00',
    lastUpdate: '2022-03-22T15:50:46.000+01:00',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: StatutAction.Terminee,
    dateEcheance: '2022-02-22T14:50:46.000Z',
    dateFinReelle: '2022-03-22T14:50:46.000Z',
    qualification: {
      libelle: 'Non SNP',
      isSituationNonProfessionnelle: false,
    },
  },
]

export const uneActionJson = (
  overrides: Partial<ActionJson> = {}
): ActionJson => {
  const defaults: ActionJson = {
    id: 'id-action-1',
    content: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Tue, 15 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Wed, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'not_started',
    dateEcheance: '2022-02-20T14:50:46.000Z',
  }

  return { ...defaults, ...overrides }
}

export const uneListeDActionsJson = (
  supplementaryActions: ActionJson[] = []
): ActionJson[] => [
  {
    id: 'id-action-1',
    content: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Tue, 15 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Wed, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'not_started',
    dateEcheance: '2022-02-20T14:50:46.000Z',
  },
  {
    id: 'id-action-2',
    content: 'Compléter son cv',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Thu, 17 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Fri, 18 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'in_progress',
    dateEcheance: '2022-02-20T14:50:46.000Z',
  },
  {
    id: 'id-action-3',
    content: 'Chercher une formation',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Sat, 19 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Sun, 20 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'done',
    dateEcheance: '2022-02-21T14:50:46.000Z',
    dateFinReelle: '2022-02-20T14:50:46.000Z',
  },
  {
    id: 'id-action-4',
    content: "Consulter les offres d'emploi",
    comment: 'Je suis un beau commentaire',
    creationDate: 'Mon, 21 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Tue, 22 Mar 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'done',
    dateEcheance: '2022-02-22T14:50:46.000Z',
    dateFinReelle: '2022-03-22T14:50:46.000Z',
    qualification: {
      libelle: 'Non SNP',
      code: 'NON_SNP',
    },
  },
  ...supplementaryActions,
]

export const desActionsInitiales = (): {
  actions: Action[]
  metadonnees: MetadonneesActions
  page: number
} => {
  return {
    actions: [],
    page: 0,
    metadonnees: { nombreTotal: 0, nombrePages: 0 },
  }
}

export const unCommentaire = (
  overrides: Partial<Commentaire> = {}
): Commentaire => {
  const defaults: Commentaire = {
    id: 'id-commentaire-1',
    message: 'ceci est un commentaire',
    date: '2022-02-20T14:50:46.000Z',
    createur: {
      id: '1',
      prenom: 'Nils',
      nom: 'Tavernier',
      type: 'conseiller',
    },
    idAction: 'id-action-1',
  }

  return { ...defaults, ...overrides }
}

export const desSituationsNonProfessionnelles =
  (): SituationNonProfessionnelle[] => [
    { code: 'SNP_1', label: 'SNP 1' },
    { code: 'SNP_2', label: 'SNP 2' },
    { code: 'SNP_3', label: 'SNP 3' },
  ]
