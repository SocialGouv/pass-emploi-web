import { Conseiller } from 'interfaces/conseiller'

export const unConseiller = (
  overrides: Partial<Conseiller> = {}
): Conseiller => {
  const defaults: Conseiller = {
    id: '1',
    firstName: 'Nils',
    lastName: 'Tavernier',
  }
  return { ...defaults, ...overrides }
}
