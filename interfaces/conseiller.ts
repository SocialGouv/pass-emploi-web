import { DateTime } from 'luxon'
import { Session } from 'next-auth'

export enum StructureConseiller {
  MILO = 'MILO',
  POLE_EMPLOI = 'POLE_EMPLOI',
  POLE_EMPLOI_BRSA = 'POLE_EMPLOI_BRSA',
  POLE_EMPLOI_AIJ = 'POLE_EMPLOI_AIJ',
  CONSEIL_DEPT = 'CONSEIL_DEPT',
  AVENIR_PRO = 'AVENIR_PRO',
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

export type SimpleConseiller = BaseConseiller & {
  idStructureMilo?: string
}

export type Conseiller = BaseConseiller & {
  notificationsSonores: boolean
  aDesBeneficiairesARecuperer: boolean
  structure: StructureConseiller
  estSuperviseur: boolean
  estSuperviseurResponsable: boolean
  agence?: { nom: string; id?: string }
  structureMilo?: { id: string; nom: string }
  dateSignatureCGU?: string
  dateVisionnageActus?: string
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

export function estPassEmploi(
  conseiller: Pick<Conseiller, 'structure'>
): boolean {
  return [
    StructureConseiller.POLE_EMPLOI_BRSA,
    StructureConseiller.POLE_EMPLOI_AIJ,
    StructureConseiller.CONSEIL_DEPT,
    StructureConseiller.AVENIR_PRO,
  ].includes(conseiller.structure)
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

export function estUserPassEmploi(user: Session.HydratedUser): boolean {
  return (
    user.structure === StructureConseiller.POLE_EMPLOI_BRSA ||
    user.structure === StructureConseiller.POLE_EMPLOI_AIJ ||
    user.structure === StructureConseiller.CONSEIL_DEPT ||
    user.structure === StructureConseiller.AVENIR_PRO
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

export function aDeNouvellesActualites(
  { dateVisionnageActus }: Conseiller,
  dernierePublication: string
): boolean {
  if (!dateVisionnageActus) return true

  return (
    DateTime.fromISO(dateVisionnageActus) <
    DateTime.fromISO(dernierePublication)
  )
}
