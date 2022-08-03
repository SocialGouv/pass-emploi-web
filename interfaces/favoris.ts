export interface Offre {
  id: string
  titre: string
  type: TypeOffre
  organisation?: string
  localisation?: string
}

export interface Recherche {
  id: string
  titre: string
  type: TypeRecherche
  metier?: string
  localisation?: string
}

export enum TypeOffre {
  OFFRE_EMPLOI = 'Offre d’emploi',
  OFFRE_ALTERNANCE = 'Alternance',
  OFFRE_IMMERSION = 'Immersion',
  OFFRE_SERVICE_CIVIQUE = 'Service civique',
}

export enum TypeRecherche {
  OFFRES_EMPLOI = 'Offres d’emploi',
  OFFRES_ALTERNANCE = 'Alternances',
  OFFRES_IMMERSION = 'Immersions',
  OFFRES_SERVICES_CIVIQUE = 'Services civiques',
}
