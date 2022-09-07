import { Offre, Recherche } from 'interfaces/favoris'

export type TypeOffreJson =
  | 'OFFRE_EMPLOI'
  | 'OFFRE_ALTERNANCE'
  | 'OFFRE_IMMERSION'
  | 'OFFRE_SERVICE_CIVIQUE'

export type TypeRechercheJson =
  | 'OFFRES_EMPLOI'
  | 'OFFRES_ALTERNANCE'
  | 'OFFRES_IMMERSION'
  | 'OFFRES_SERVICES_CIVIQUE'

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

export function jsonToOffre(offreJson: OffreJson): Offre {
  return {
    id: offreJson.idOffre,
    localisation: offreJson.localisation,
    organisation: offreJson.organisation,
    titre: offreJson.titre,
    type: jsonToTypeOffre(offreJson.type),
    hasLinkPE: ['OFFRE_ALTERNANCE', 'OFFRE_EMPLOI'].includes(offreJson.type),
    hasLinkServiceCivique: offreJson.type === 'OFFRE_SERVICE_CIVIQUE',
  }
}

export function jsonToTypeOffre(type: TypeOffreJson): string {
  switch (type) {
    case 'OFFRE_EMPLOI':
      return 'Offre d’emploi'
    case 'OFFRE_ALTERNANCE':
      return 'Alternance'
    case 'OFFRE_IMMERSION':
      return 'Immersion'
    case 'OFFRE_SERVICE_CIVIQUE':
      return 'Service civique'
    default:
      console.warn(`Type offre ${type} inconnu`)
      return ''
  }
}

export function jsonToRecherche(rechercheJson: RechercheJson): Recherche {
  return {
    id: rechercheJson.id,
    titre: rechercheJson.titre,
    type: jsonToTypeRecherche(rechercheJson.type),
    metier: rechercheJson.metier ? rechercheJson.metier : '',
    localisation: rechercheJson.localisation ? rechercheJson.localisation : '',
  }
}

export function jsonToTypeRecherche(type: TypeRechercheJson): string {
  switch (type) {
    case 'OFFRES_EMPLOI':
      return 'Offres d’emploi'
    case 'OFFRES_ALTERNANCE':
      return 'Alternances'
    case 'OFFRES_IMMERSION':
      return 'Immersions'
    case 'OFFRES_SERVICES_CIVIQUE':
      return 'Services civiques'
    default:
      console.warn(`Type recherche ${type} inconnu`)
      return ''
  }
}
