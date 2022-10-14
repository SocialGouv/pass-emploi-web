import { DateTime } from 'luxon'

import { BaseServiceCivique, TypeOffre } from 'interfaces/offre'

export type ServiceCiviqueItemJson = {
  id: string
  titre: string
  domaine: string

  ville?: string
  organisation?: string
  dateDeDebut?: string
}

export function jsonToServiceCiviqueItem(
  json: ServiceCiviqueItemJson
): BaseServiceCivique {
  const serviceCivique: BaseServiceCivique = {
    type: TypeOffre.SERVICE_CIVIQUE,
    id: json.id,
    titre: json.titre,
    domaine: json.domaine,
  }

  if (json.ville) serviceCivique.ville = json.ville
  if (json.organisation) serviceCivique.organisation = json.organisation
  if (json.dateDeDebut)
    serviceCivique.dateDeDebut = DateTime.fromISO(json.dateDeDebut)

  return serviceCivique
}
