import { BaseServiceCivique, TypeOffre } from 'interfaces/offre'

export type ServiceCiviqueItemJson = {
  id: string
  titre: string
  domaine: string
  ville: string
  organisation: string
  dateDeDebut: string
}

export function jsonToServiceCiviqueItem(
  json: ServiceCiviqueItemJson
): BaseServiceCivique {
  return {
    type: TypeOffre.SERVICE_CIVIQUE,
    id: json.id,
    titre: json.titre,
    domaine: json.domaine,
    ville: json.ville,
    organisation: json.organisation,
    dateDeDebut: json.dateDeDebut,
  }
}
