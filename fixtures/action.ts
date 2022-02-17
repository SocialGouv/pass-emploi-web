import { ActionJeune, ActionStatus } from 'interfaces/action'
import { ActionJeuneJson } from '../interfaces/json/action'

export const uneAction = (
  overrides: Partial<ActionJeune> = {}
): ActionJeune => {
  const defaults: ActionJeune = {
    id: 'id-action-1',
    content: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Tue, 15 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Tue, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: ActionStatus.NotStarted,
  }

  return { ...defaults, ...overrides }
}

export const uneListeDActions = (
  actionsSupplementaires: ActionJeune[] = []
): ActionJeune[] => [
  {
    id: 'id-action-1',
    content: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Tue, 15 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Tue, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: ActionStatus.NotStarted,
  },
  {
    id: 'id-action-2',
    content: 'Compléter son cv',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Tue, 15 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Tue, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: ActionStatus.InProgress,
  },
  {
    id: 'id-action-3',
    content: 'Chercher une formation',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Tue, 15 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Tue, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: ActionStatus.Done,
  },
  ...actionsSupplementaires,
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
    lastUpdate: 'Tue, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'not_started',
  },
  {
    id: 'id-action-2',
    content: 'Compléter son cv',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Tue, 15 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Tue, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'in_progress',
  },
  {
    id: 'id-action-3',
    content: 'Chercher une formation',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Tue, 15 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Tue, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'done',
  },
  ...supplementaryActions,
]
