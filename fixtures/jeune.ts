import { Jeune } from 'interfaces/jeune'

export const unJeune = (overrides: Partial<Jeune> = {}): Jeune =>
  ({
    id: 'jeune-1',
    firstName: 'Kenji',
    lastName: 'Jirac',
    email: 'kenji.jirac@email.fr',
    isActivated: false,
    creationDate: '2021-12-07T17:30:07.756Z',
    ...overrides,
  } as Jeune)
