import { BaseServiceCivique, TypeOffre } from 'interfaces/offre'

export type ServiceCiviqueItemJson = {
  id: string
  titre: string
}

export function jsonToServiceCiviqueItem(
  json: ServiceCiviqueItemJson
): BaseServiceCivique {
  return {
    type: TypeOffre.SERVICE_CIVIQUE,
    id: json.id,
    titre: json.titre,
  }
}
