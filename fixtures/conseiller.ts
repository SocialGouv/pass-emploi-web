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
    estSuperviseurResponsable: false,
    structure: StructureConseiller.MILO,
    dateSignatureCGU: '2023-10-03T00:00:00.000+02:00',
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
    dateSignatureCGU: '2023-10-03',
  }
  return { ...defaults, ...overrides }
}
