import { Conseiller } from 'interfaces/conseiller'
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

export interface ConseillerJson {
  id: string
  firstName: string
  lastName: string
  email?: string
  agence?: {
    id?: string
    nom: string
  }
  notificationsSonores: boolean
  aDesBeneficiairesARecuperer: boolean
}

export function jsonToConseiller(conseillerJson: ConseillerJson): Conseiller {
  const { agence, ...conseiller } = conseillerJson
  if (agence) {
    return {
      ...conseiller,
      agence: agence.nom,
    }
  } else {
    return conseiller
  }
}
