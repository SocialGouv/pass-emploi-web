import { Session } from 'next-auth'

import { ConseillerHistorique } from 'interfaces/beneficiaire'
import { Conseiller, SimpleConseiller } from 'interfaces/conseiller'
import { Structure } from 'interfaces/structure'

export interface ConseillerHistoriqueJson {
  id: string
  nom: string
  prenom: string
  date: string
}

export function toConseillerHistorique(
  conseiller: ConseillerHistoriqueJson
): ConseillerHistorique {
  return {
    id: conseiller.id,
    nom: conseiller.nom,
    prenom: conseiller.prenom,
    depuis: conseiller.date,
  }
}

export type SimpleConseillerJson = {
  id: string
  prenom: string
  nom: string
  email?: string
  idStructureMilo?: string
}

export interface ConseillerJson {
  id: string
  firstName: string
  lastName: string
  email?: string
  agence?: {
    id?: string
    nom: string
  }
  structureMilo?: {
    id: string
    nom: string
  }
  notificationsSonores: boolean
  aDesBeneficiairesARecuperer: boolean
  dateSignatureCGU?: string
  dateVisionnageActus?: string
}

export function jsonToSimpleConseiller(
  json: SimpleConseillerJson
): SimpleConseiller {
  const conseiller: SimpleConseiller = {
    id: json.id,
    firstName: json.prenom,
    lastName: json.nom,
  }

  if (json.email) conseiller.email = json.email
  if (json.idStructureMilo) conseiller.idStructureMilo = json.idStructureMilo
  return conseiller
}

export function jsonToConseiller(
  conseillerJson: ConseillerJson,
  { structure, estSuperviseur, estSuperviseurResponsable }: Session.HydratedUser
): Conseiller {
  const { agence, dateSignatureCGU, dateVisionnageActus, ...json } =
    conseillerJson
  const conseiller: Conseiller = {
    ...json,
    structure: structure as Structure,
    estSuperviseur,
    estSuperviseurResponsable,
  }

  if (agence) {
    conseiller.agence = agence
  }

  if (dateSignatureCGU) {
    conseiller.dateSignatureCGU = dateSignatureCGU
  }

  if (dateVisionnageActus) {
    conseiller.dateVisionnageActus = dateVisionnageActus
  }

  return conseiller
}
