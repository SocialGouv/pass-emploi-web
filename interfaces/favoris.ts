export interface Offre {
  id: string
  titre: string
  type: string
  urlParam: string
  dateUpdate: string
  aPostule: boolean
  organisation?: string
  localisation?: string
}
