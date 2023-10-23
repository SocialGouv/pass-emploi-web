import { DateTime } from 'luxon'
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
  dateSignatureCGU?: string
}

export function estPassEmploi(conseiller: Conseiller): boolean {
  return conseiller.structure === StructureConseiller.PASS_EMPLOI
}

export function estMilo(conseiller: Conseiller): boolean {
  return conseiller.structure === StructureConseiller.MILO
}

export function estPoleEmploi(conseiller: Conseiller): boolean {
  return (
    conseiller.structure === StructureConseiller.POLE_EMPLOI ||
    conseiller.structure === StructureConseiller.POLE_EMPLOI_BRSA
  )
}

export function estPoleEmploiBRSA(conseiller: Conseiller): boolean {
  return conseiller.structure === StructureConseiller.POLE_EMPLOI_BRSA
}

export function estSuperviseur(conseiller: Conseiller): boolean {
  return conseiller.estSuperviseur
}

export function estSuperviseurPEBRSA(conseiller: Conseiller): boolean {
  return conseiller.estSuperviseurPEBRSA
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

export function aEtablissement(conseiller: Conseiller): boolean {
  return estMilo(conseiller)
    ? Boolean(conseiller.structureMilo)
    : Boolean(conseiller.agence)
}

export function peutAccederAuxSessions(conseiller: Conseiller): boolean {
  return estMilo(conseiller) && Boolean(conseiller.structureMilo)
}

export function doitSignerLesCGU(conseiller: Conseiller): boolean {
  return (
    !conseiller.dateSignatureCGU ||
    DateTime.fromISO(conseiller.dateSignatureCGU) <
      DateTime.fromISO(process.env.VERSION_CGU_COURANTE!)
  )
}
