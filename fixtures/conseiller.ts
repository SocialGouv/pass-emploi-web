import { Conseiller } from 'interfaces/conseiller'
import {
  SimpleConseillerJson,
  ConseillerJson,
} from 'interfaces/json/conseiller'
import { structureMilo } from 'interfaces/structure'

export const unConseiller = (
  overrides: Partial<Conseiller> = {}
): Conseiller => {
  const defaults: Conseiller = {
    id: 'id-conseiller-1',
    firstName: 'Nils',
    lastName: 'Tavernier',
    notificationsSonores: false,
    aDesBeneficiairesARecuperer: false,
    estSuperviseur: false,
    estSuperviseurResponsable: false,
    structure: structureMilo,
    dateSignatureCGU: '2023-10-03T00:00:00.000+02:00',
  }
  return { ...defaults, ...overrides }
}

export const unBaseConseillerJson = (
  overrides: Partial<SimpleConseillerJson> = {}
): SimpleConseillerJson => {
  const defaults: SimpleConseillerJson = {
    id: 'id-conseiller-1',
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
    id: 'id-conseiller-1',
    firstName: 'Nils',
    lastName: 'Tavernier',
    notificationsSonores: false,
    aDesBeneficiairesARecuperer: false,
    dateSignatureCGU: '2023-10-03',
    dateVisionnageActus: '2023-10-03',
  }
  return { ...defaults, ...overrides }
}
