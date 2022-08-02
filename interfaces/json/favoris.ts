import { Offre, Recherche, TypeOffre } from '../favoris'

export interface OffreJson {
  idOffre: string
  titre: string
  type: TypeOffreJson
  organisation?: string
  localisation?: string
}

enum TypeOffreJson {
  OFFRE_EMPLOI = 'OFFRE_EMPLOI',
  OFFRE_ALTERNANCE = 'OFFRE_ALTERNANCE',
  OFFRE_IMMERSION = 'OFFRE_IMMERSION',
  OFFRE_SERVICE_CIVIQUE = 'OFFRE_SERVICE_CIVIQUE',
}

export function jsonToOffre(offreJson: OffreJson): Offre {
  return {
    idOffre: offreJson.idOffre,
    localisation: offreJson.localisation,
    organisation: offreJson.organisation,
    titre: offreJson.titre,
    type: TypeOffre[offreJson.type],
  }
}

export function jsonToRecherche(rechercheJson: RechercheJson): Recherche {
  return {
    titre: rechercheJson.titre,
    type: rechercheJson.type,
    // TODO voir avec JOSEPH le sixieme n'a pas de localisation
    metier: rechercheJson.metier ? rechercheJson.metier : '',
    // TODO voir avec JOSEPH le premier n'a pas de localisation
    localisation: rechercheJson.localisation ? rechercheJson.localisation : '',
  }
}

export interface RechercheJson {
  id: string
  titre: string
  type: string
  metier?: string
  localisation?: string
}
