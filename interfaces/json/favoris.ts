import { Offre, Recherche, TypeOffre, TypeRecherche } from 'interfaces/favoris'

export interface OffreJson {
  idOffre: string
  titre: string
  type: TypeOffreJson
  organisation?: string
  localisation?: string
}

export interface RechercheJson {
  id: string
  titre: string
  type: TypeRechercheJson
  metier?: string
  localisation?: string
}

export enum TypeOffreJson {
  OFFRE_EMPLOI = 'OFFRE_EMPLOI',
  OFFRE_ALTERNANCE = 'OFFRE_ALTERNANCE',
  OFFRE_IMMERSION = 'OFFRE_IMMERSION',
  OFFRE_SERVICE_CIVIQUE = 'OFFRE_SERVICE_CIVIQUE',
}

export enum TypeRechercheJson {
  OFFRES_EMPLOI = 'OFFRES_EMPLOI',
  OFFRES_ALTERNANCE = 'OFFRES_ALTERNANCE',
  OFFRES_IMMERSION = 'OFFRES_IMMERSION',
  OFFRES_SERVICES_CIVIQUE = 'OFFRES_SERVICES_CIVIQUE',
}

export function jsonToOffre(offreJson: OffreJson): Offre {
  return {
    id: offreJson.idOffre,
    localisation: offreJson.localisation,
    organisation: offreJson.organisation,
    titre: offreJson.titre,
    type: TypeOffre[offreJson.type],
  }
}

export function jsonToRecherche(rechercheJson: RechercheJson): Recherche {
  return {
    id: rechercheJson.id,
    titre: rechercheJson.titre,
    type: TypeRecherche[rechercheJson.type],
    // TODO voir avec JOSEPH le sixieme n'a pas de localisation
    metier: rechercheJson.metier ? rechercheJson.metier : '',
    // TODO voir avec JOSEPH le premier n'a pas de localisation
    localisation: rechercheJson.localisation ? rechercheJson.localisation : '',
  }
}
