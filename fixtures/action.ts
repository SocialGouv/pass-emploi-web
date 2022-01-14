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
