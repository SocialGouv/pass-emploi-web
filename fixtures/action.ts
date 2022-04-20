import { ActionJeune, ActionStatus } from 'interfaces/action'
import { ActionJeuneJson } from '../interfaces/json/action'

export const uneAction = (
  overrides: Partial<ActionJeune> = {}
): ActionJeune => {
  const defaults: ActionJeune = {
    id: 'id-action-1',
    content: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: '2022-02-15T14:50:46.000Z',
    lastUpdate: '2022-02-16T14:50:46.000Z',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: ActionStatus.NotStarted,
  }

  return { ...defaults, ...overrides }
}

export const uneListeDActions = (): ActionJeune[] => [
  uneAction(),
  {
    id: 'id-action-2',
    content: 'Compléter son cv',
    comment: 'Je suis un beau commentaire',
    creationDate: '2022-02-17T14:50:46.000Z',
    lastUpdate: '2022-02-18T14:50:46.000Z',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: ActionStatus.InProgress,
  },
  {
    id: 'id-action-3',
    content: 'Chercher une formation',
    comment: 'Je suis un beau commentaire',
    creationDate: '2022-02-19T14:50:46.000Z',
    lastUpdate: '2022-02-20T14:50:46.000Z',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: ActionStatus.Done,
  },
]

export const uneActionJson = (
  overrides: Partial<ActionJeuneJson> = {}
): ActionJeuneJson => {
  const defaults: ActionJeuneJson = {
    id: 'id-action-1',
    content: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Tue, 15 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Tue, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'not_started',
  }

  return { ...defaults, ...overrides }
}

export const uneListeDActionsJson = (
  supplementaryActions: ActionJeuneJson[] = []
): ActionJeuneJson[] => [
  {
    id: 'id-action-1',
    content: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Tue, 15 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Wed, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'not_started',
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
  },
  ...supplementaryActions,
]
