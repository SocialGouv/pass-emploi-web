import { Session } from 'next-auth'

export enum StructureConseiller {
  MILO = 'MILO',
  POLE_EMPLOI = 'POLE_EMPLOI',
  PASS_EMPLOI = 'PASS_EMPLOI',
  POLE_EMPLOI_BRSA = 'POLE_EMPLOI_BRSA',
}

export enum UserType {
  CONSEILLER = 'CONSEILLER',
}

export enum UserRole {
  SUPERVISEUR = 'SUPERVISEUR',
  SUPERVISEUR_PE_BRSA = 'SUPERVISEUR_PE_BRSA',
}

export type BaseConseiller = {
  id: string
  firstName: string
  lastName: string
  email?: string
}

export interface Conseiller extends BaseConseiller {
  notificationsSonores: boolean
  aDesBeneficiairesARecuperer: boolean
  structure: StructureConseiller
  estSuperviseur: boolean
  estSuperviseurPEBRSA: boolean
  agence?: { nom: string; id?: string }
}

export function estPoleEmploiCEJ(conseiller: Conseiller): boolean {
  return conseiller.structure === StructureConseiller.POLE_EMPLOI
}

export function estMilo(conseiller: Conseiller): boolean {
  return conseiller.structure === StructureConseiller.MILO
}

export function estSuperviseur(conseiller: Conseiller): boolean {
  return conseiller.estSuperviseur
}

export function estSuperviseurPEBRSA(conseiller: Conseiller): boolean {
  return conseiller.estSuperviseurPEBRSA
}

export function estPoleEmploiBRSA(conseiller: Conseiller): boolean {
  return conseiller.structure === StructureConseiller.POLE_EMPLOI_BRSA
}

export function estPoleEmploi(conseiller: Conseiller): boolean {
  return (
    conseiller.structure === StructureConseiller.POLE_EMPLOI ||
    conseiller.structure === StructureConseiller.POLE_EMPLOI_BRSA
  )
}
export function estUserPoleEmploi(user: Session.HydratedUser): boolean {
  return (
    user.structure === StructureConseiller.POLE_EMPLOI ||
    user.structure === StructureConseiller.POLE_EMPLOI_BRSA
  )
}

export function estEarlyAdopter(conseiller: Conseiller): boolean {
  const idsAgences = new Array(process.env.IDS_AGENCES_EARLY_ADOPTERS)
  return (
    idsAgences.includes(conseiller.agence?.id) ||
    process.env.ENABLE_SESSIONS_STAGING
  )
}
