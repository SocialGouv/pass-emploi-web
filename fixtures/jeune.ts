import { Jeune } from 'interfaces/jeune'

export const unJeune = (overrides: Partial<Jeune> = {}): Jeune =>
  ({
    id: 'jeune-1',
    firstName: 'Kenji',
    lastName: 'Jirac',
    email: 'kenji.jirac@email.fr',
    isActivated: false,
    ...overrides,
  } as Jeune)
