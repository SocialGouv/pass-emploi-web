export interface Offre {
  id: string
  titre: string
  type: string
  urlParam: string
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
