import { Session } from 'next-auth'

import {
  BaseConseiller,
  Conseiller,
  StructureConseiller,
} from 'interfaces/conseiller'
import { ConseillerHistorique } from 'interfaces/jeune'

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

export type BaseConseillerJson = {
  id: string
  prenom: string
  nom: string
  email?: string
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
}

export function jsonToBaseConseiller(json: BaseConseillerJson): BaseConseiller {
  const conseiller: BaseConseiller = {
    id: json.id,
    firstName: json.prenom,
    lastName: json.nom,
  }
  if (json.email) conseiller.email = json.email
  return conseiller
}

export function jsonToConseiller(
  conseillerJson: ConseillerJson,
  { structure, estSuperviseur, estSuperviseurResponsable }: Session.HydratedUser
): Conseiller {
  const { agence, dateSignatureCGU, ...json } = conseillerJson
  const conseiller: Conseiller = {
    ...json,
    structure: structure as StructureConseiller,
    estSuperviseur,
    estSuperviseurResponsable,
  }

  if (agence) {
    conseiller.agence = agence
  }

  if (dateSignatureCGU) {
    conseiller.dateSignatureCGU = dateSignatureCGU
  }

  return conseiller
}
