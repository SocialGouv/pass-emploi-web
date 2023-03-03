export enum StructureConseiller {
  MILO = 'MILO',
  POLE_EMPLOI = 'POLE_EMPLOI',
  PASS_EMPLOI = 'PASS_EMPLOI',
}

export enum UserType {
  CONSEILLER = 'CONSEILLER',
}

export enum UserRole {
  SUPERVISEUR = 'SUPERVISEUR',
}

export interface Conseiller {
  id: string
  firstName: string
  lastName: string
  notificationsSonores: boolean
  aDesBeneficiairesARecuperer: boolean
  structure: StructureConseiller
  estSuperviseur: boolean
  email?: string
  agence?: { nom: string; id?: string }
}

export function isPoleEmploi(conseiller: Conseiller): boolean {
  return conseiller.structure === StructureConseiller.POLE_EMPLOI
}
export function isMilo(conseiller: Conseiller): boolean {
  return conseiller.structure === StructureConseiller.MILO
}
