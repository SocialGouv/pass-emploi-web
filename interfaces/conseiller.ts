import { DateTime } from 'luxon'
import { Session } from 'next-auth'

export enum StructureConseiller {
  MILO = 'MILO',
  POLE_EMPLOI = 'POLE_EMPLOI',
  POLE_EMPLOI_BRSA = 'POLE_EMPLOI_BRSA',
  POLE_EMPLOI_AIJ = 'POLE_EMPLOI_AIJ',
  CONSEIL_DEPT = 'CONSEIL_DEPT',
}

export enum UserType {
  CONSEILLER = 'CONSEILLER',
}

export enum UserRole {
  SUPERVISEUR = 'SUPERVISEUR',
  SUPERVISEUR_RESPONSABLE = 'SUPERVISEUR_RESPONSABLE',
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
  estSuperviseurResponsable: boolean
  agence?: { nom: string; id?: string }
  structureMilo?: { id: string; nom: string }
  dateSignatureCGU?: string
}

export function estMilo(conseiller: Conseiller): boolean {
  return conseiller.structure === StructureConseiller.MILO
}

export function estConseilDepartemental(conseiller: Conseiller): boolean {
  return conseiller.structure === StructureConseiller.CONSEIL_DEPT
}

export function estBRSA(conseiller: Conseiller): boolean {
  return conseiller.structure === StructureConseiller.POLE_EMPLOI_BRSA
}

export function estPassEmploi(conseiller: Conseiller): boolean {
  return (
    conseiller.structure === StructureConseiller.POLE_EMPLOI_BRSA ||
    conseiller.structure === StructureConseiller.POLE_EMPLOI_AIJ
  )
}

export function estSuperviseur(conseiller: Conseiller): boolean {
  return conseiller.estSuperviseur
}

export function estSuperviseurResponsable(conseiller: Conseiller): boolean {
  return conseiller.estSuperviseurResponsable
}

export function estUserMilo(user: Session.HydratedUser): boolean {
  return user.structure === StructureConseiller.MILO
}

export function estUserCD(user: Session.HydratedUser): boolean {
  return user.structure === StructureConseiller.CONSEIL_DEPT
}

export function aEtablissement(conseiller: Conseiller): boolean {
  return estMilo(conseiller)
    ? Boolean(conseiller.structureMilo)
    : Boolean(conseiller.agence)
}

export function peutAccederAuxSessions(conseiller: Conseiller): boolean {
  return estMilo(conseiller) && Boolean(conseiller.structureMilo)
}

export function utiliseChat({
  id,
  structure,
}: Conseiller | Session.HydratedUser): boolean {
  return (
    structure !== StructureConseiller.POLE_EMPLOI ||
    (process.env.NEXT_PUBLIC_ENABLE_CVM !== 'true' &&
      !(process.env.NEXT_PUBLIC_CVM_EARLY_ADOPTERS ?? '')
        .split(',')
        .includes(id))
  )
}

export function doitSignerLesCGU(conseiller: Conseiller): boolean {
  if (!conseiller.dateSignatureCGU) return false

  return estPassEmploi(conseiller)
    ? DateTime.fromISO(conseiller.dateSignatureCGU) <
        DateTime.fromISO(process.env.VERSION_CGU_PASS_EMPLOI_COURANTE!)
    : DateTime.fromISO(conseiller.dateSignatureCGU) <
        DateTime.fromISO(process.env.VERSION_CGU_CEJ_COURANTE!)
}
