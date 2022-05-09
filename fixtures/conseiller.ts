import { ConseillerJson } from '../interfaces/json/conseiller'

import { Conseiller } from 'interfaces/conseiller'

export const unConseiller = (
  overrides: Partial<Conseiller> = {}
): Conseiller => {
  const defaults: Conseiller = {
    id: '1',
    firstName: 'Nils',
    lastName: 'Tavernier',
    notificationsSonores: false,
    agence: 'Milo Marseille',
  }
  return { ...defaults, ...overrides }
}

export const unConseillerJson = (
  overrides: Partial<ConseillerJson> = {}
): ConseillerJson => {
  const defaults: ConseillerJson = {
    id: '1',
    firstName: 'Nils',
    lastName: 'Tavernier',
    agence: {
      nom: 'Milo Marseille',
      id: 'ID',
    },
    notificationsSonores: false,
  }
  return { ...defaults, ...overrides }
}
