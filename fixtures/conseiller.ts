import { Conseiller } from 'interfaces/conseiller'
import { ConseillerJson } from 'interfaces/json/conseiller'

export const unConseiller = (
  overrides: Partial<Conseiller> = {}
): Conseiller => {
  const defaults: Conseiller = {
    id: '1',
    firstName: 'Nils',
    lastName: 'Tavernier',
    notificationsSonores: false,
    aDesBeneficiairesARecuperer: false,
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
    notificationsSonores: false,
    aDesBeneficiairesARecuperer: false,
  }
  return { ...defaults, ...overrides }
}
