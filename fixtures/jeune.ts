import { Jeune } from 'interfaces/jeune'

export const unJeune = (overrides: Partial<Jeune> = {}): Jeune =>
  ({
    id: 'jeune-1',
    firstName: 'Kenji',
    lastName: 'Jirac',
    isActivated: false,
    ...overrides,
  } as Jeune)
