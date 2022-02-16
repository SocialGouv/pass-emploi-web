import { ActionJeune, ActionStatus } from 'interfaces/action'

export const uneAction = (
  overrides: Partial<ActionJeune> = {}
): ActionJeune => {
  const defaults: ActionJeune = {
    id: 'no-com-1',
    content: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: new Date(2021, 9, 21, 10),
    lastUpdate: new Date(2021, 9, 21, 10),
    creator: 'Nils',
    creatorType: 'conseiller',
    isDone: false,
    status: ActionStatus.NotStarted,
  }

  return { ...defaults, ...overrides }
}

export const uneListeDActions = (
  overrides: Partial<ActionJeune[]> = []
): ActionJeune[] =>
  [
    {
      id: 'no-com-1',
      content: 'Identifier ses atouts et ses compétences',
      comment: 'Je suis un beau commentaire',
      creationDate: new Date(2021, 9, 21, 10),
      lastUpdate: new Date(2021, 9, 21, 10),
      creator: 'Nils',
      creatorType: 'conseiller',
      isDone: false,
      status: ActionStatus.NotStarted,
    },
    {
      id: 'no-com-2',
      content: 'Identifier ses atouts et ses compétences',
      comment: 'Je suis un beau commentaire',
      creationDate: new Date(2021, 9, 21, 10),
      lastUpdate: new Date(2021, 9, 21, 10),
      creator: 'Nils',
      creatorType: 'conseiller',
      isDone: false,
      status: ActionStatus.InProgress,
    },
    {
      id: 'no-com-3',
      content: 'Identifier ses atouts et ses compétences',
      comment: 'Je suis un beau commentaire',
      creationDate: new Date(2021, 9, 21, 10),
      lastUpdate: new Date(2021, 9, 21, 10),
      creator: 'Nils',
      creatorType: 'conseiller',
      isDone: false,
      status: ActionStatus.Done,
    },
    ...overrides,
  ] as ActionJeune[]
