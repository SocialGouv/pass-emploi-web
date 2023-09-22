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
  structureMilo?: { id: string; nom: string }
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

export function estUserMilo(user: Session.HydratedUser): boolean {
  return user.structure === StructureConseiller.MILO
}

export function estUserPoleEmploi(user: Session.HydratedUser): boolean {
  return (
    user.structure === StructureConseiller.POLE_EMPLOI ||
    user.structure === StructureConseiller.POLE_EMPLOI_BRSA
  )
}

export function peutAccederAuxSessions(conseiller: Conseiller): boolean {
  return (
    estMilo(conseiller) &&
    (process.env.ENABLE_SESSIONS_MILO === 'true' || estEarlyAdopter(conseiller))
  )
}

function estEarlyAdopter(conseiller: Conseiller): boolean {
  const env = process.env.IDS_STRUCTURES_EARLY_ADOPTERS
  const idsStructures = env?.split('|') || []

  return (
    Boolean(conseiller.structureMilo) &&
    idsStructures.includes(conseiller.structureMilo!.id)
  )
}
