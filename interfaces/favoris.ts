export interface Offre {
  idOffre: string
  titre: string
  type: TypeOffre
  organisation?: string
  localisation?: string
}

export interface Recherche {
  titre: string
  type: string
  metier?: string
  localisation?: string
}

export enum TypeOffre {
  OFFRE_EMPLOI = 'OFFRE_EMPLOI',
  OFFRE_ALTERNANCE = 'OFFRE_ALTERNANCE',
  OFFRE_IMMERSION = 'OFFRE_IMMERSION',
  OFFRE_SERVICE_CIVIQUE = 'OFFRE_SERVICE_CIVIQUE',
}
