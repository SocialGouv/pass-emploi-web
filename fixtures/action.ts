import { ActionStatus, ActionJeune } from 'interfaces/action'

export const uneAction = (overrides: Partial<ActionJeune> = {}): ActionJeune =>
  ({
    id: 'no-com-1',
    content: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Thu, 21 Oct 2021 10:00:00 GMT',
    lastUpdate: '',
    creator: 'Nils',
    isDone: false,
    status: ActionStatus.NotStarted,
    ...overrides,
  } as ActionJeune)
