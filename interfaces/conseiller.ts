export enum UserStructure {
  MILO = 'MILO',
  POLE_EMPLOI = 'POLE_EMPLOI',
  PASS_EMPLOI = 'PASS_EMPLOI',
}

export interface Conseiller {
  id: string
  firstName: string
  lastName: string
}
