export interface Offre {
  id: string
  titre: string
  type: string
  hasLinkPE: boolean
  hasLinkServiceCivique: boolean
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
