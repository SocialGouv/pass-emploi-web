import { DateTime } from 'luxon'
import { Session } from 'next-auth'

import { ActualitesParsees } from 'interfaces/actualites'
import { MissionLocale } from 'interfaces/referentiel'
import {
  estMilo,
  estPassEmploi,
  Structure,
  structureFTCej,
} from 'interfaces/structure'

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
  structure: Structure
  estSuperviseur: boolean
  estSuperviseurResponsable: boolean
  agence?: { nom: string; id?: string }
  structureMilo?: MissionLocale
  dateSignatureCGU?: string
  dateVisionnageActus?: string
}

export function estSuperviseur(conseiller: Conseiller): boolean {
  return conseiller.estSuperviseur
}

export function estSuperviseurResponsable(conseiller: Conseiller): boolean {
  return conseiller.estSuperviseurResponsable
}

export function aEtablissement(conseiller: Conseiller): boolean {
  return estMilo(conseiller.structure)
    ? Boolean(conseiller.structureMilo)
    : Boolean(conseiller.agence)
}

export function peutAccederAuxSessions(conseiller: Conseiller): boolean {
  return estMilo(conseiller.structure) && Boolean(conseiller.structureMilo)
}

export function utiliseChat({
  id,
  structure,
}: Conseiller | Session.HydratedUser): boolean {
  const cvmOverride =
    structure === structureFTCej &&
    process.env.NEXT_PUBLIC_ENABLE_CVM === 'true'
  const estEarlyAdopterDeCvm = (
    process.env.NEXT_PUBLIC_CVM_EARLY_ADOPTERS ?? ''
  )
    .split(',')
    .includes(id)
  const utiliseCvm = cvmOverride || estEarlyAdopterDeCvm

  return !utiliseCvm
}

export function doitSignerLesCGU(conseiller: Conseiller): boolean {
  if (!conseiller.dateSignatureCGU) return false

  return estPassEmploi(conseiller.structure)
    ? DateTime.fromISO(conseiller.dateSignatureCGU) <
        DateTime.fromISO(process.env.VERSION_CGU_PASS_EMPLOI_COURANTE!)
    : DateTime.fromISO(conseiller.dateSignatureCGU) <
        DateTime.fromISO(process.env.VERSION_CGU_CEJ_COURANTE!)
}

export function compterNouvellesActualites(
  dateVisionnageActus: string | undefined,
  actualites: ActualitesParsees
): number {
  if (!dateVisionnageActus) return actualites.length

  return actualites.filter(
    ({ dateDerniereModification }) =>
      DateTime.fromISO(dateVisionnageActus) <
      DateTime.fromISO(dateDerniereModification)
  ).length
}
