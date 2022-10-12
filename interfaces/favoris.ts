export interface Offre {
  id: string
  titre: string
  type: string
  isEmploi: boolean
  isAlternance: boolean
  isServiceCivique: boolean
  organisation?: string
  localisation?: string
}

export interface Recherche {
  id: string
  titre: string
  type: string
  metier?: string
  localisation?: string
}
