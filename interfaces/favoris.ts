import { DateTime } from 'luxon'

export interface Offre {
  id: string
  titre: string
  type: string
  urlParam: string
  dateUpdate: DateTime
  aPostule: boolean
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
