export enum UserStructure {
  MILO = 'MILO',
  POLE_EMPLOI = 'POLE_EMPLOI',
  PASS_EMPLOI = 'PASS_EMPLOI',
}

export interface Agence {
  id: string
  nom: string
}

export interface Conseiller {
  id: string
  firstName: string
  lastName: string
  email?: string
  agence?: Agence
}
