import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import { BaseConseillerJson, ConseillerJson } from 'interfaces/json/conseiller'

export const unConseiller = (
  overrides: Partial<Conseiller> = {}
): Conseiller => {
  const defaults: Conseiller = {
    id: '1',
    firstName: 'Nils',
    lastName: 'Tavernier',
    notificationsSonores: false,
    aDesBeneficiairesARecuperer: false,
    estSuperviseur: false,
    structure: StructureConseiller.PASS_EMPLOI,
  }
  return { ...defaults, ...overrides }
}

export const unBaseConseillerJson = (
  overrides: Partial<BaseConseillerJson> = {}
): BaseConseillerJson => {
  const defaults: BaseConseillerJson = {
    id: '1',
    prenom: 'Nils',
    nom: 'Tavernier',
    email: 'nils.tavernier@mail.com',
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
