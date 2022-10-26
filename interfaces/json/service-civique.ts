import {
  BaseServiceCivique,
  DetailServiceCivique,
  TypeOffre,
} from 'interfaces/offre'

export type ServiceCiviqueItemJson = {
  id: string
  titre: string
  domaine: string

  ville?: string
  organisation?: string
  dateDeDebut?: string
}

export type DetailServiceCiviqueJson = {
  domaine: string
  titre: string
  ville?: string
  organisation?: string
  dateDeDebut?: string
  dateDeFin?: string
  description?: string
  lienAnnonce?: string
  adresseOrganisation?: string
  adresseMission?: string
  urlOrganisation?: string
  codeDepartement?: string
  codePostal?: string
  descriptionOrganisation?: string
}

export function jsonToDetailServiceCivique(
  id: string,
  json: DetailServiceCiviqueJson
): DetailServiceCivique {
  const serviceCivique: DetailServiceCivique = {
    type: TypeOffre.SERVICE_CIVIQUE,
    id: id,
    titre: json.titre,
    domaine: json.domaine,
  }

  if (json.ville) serviceCivique.ville = json.ville
  if (json.organisation) serviceCivique.organisation = json.organisation
  if (json.dateDeDebut) serviceCivique.dateDeDebut = json.dateDeDebut
  if (json.dateDeFin) serviceCivique.dateDeFin = json.dateDeFin
  if (json.lienAnnonce) serviceCivique.lienAnnonce = json.lienAnnonce
  if (json.description) serviceCivique.description = json.description
  if (json.descriptionOrganisation)
    serviceCivique.descriptionOrganisation = json.descriptionOrganisation
  if (json.urlOrganisation)
    serviceCivique.urlOrganisation = json.urlOrganisation
  if (json.adresseMission) serviceCivique.adresseMission = json.adresseMission
  if (json.adresseOrganisation)
    serviceCivique.adresseOrganisation = json.adresseOrganisation
  if (json.codeDepartement)
    serviceCivique.codeDepartement = json.codeDepartement
  if (json.codePostal) serviceCivique.codePostal = json.codePostal

  return serviceCivique
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
  if (json.dateDeDebut) serviceCivique.dateDeDebut = json.dateDeDebut

  return serviceCivique
}
