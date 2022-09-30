export type BaseOffreEmploi = {
  id: string
  titre: string
  nomEntreprise: string
  localisation: string
  typeContrat: string
  duree: string
}

export type DetailOffreEmploi = BaseOffreEmploi & {
  urlPostulation: string
  dateActualisation: string
  salaire: string
  horaires: string
  description: string
}
