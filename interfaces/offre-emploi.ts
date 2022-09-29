type BaseOffreEmploi = {
  id: string
  titre: string
}

export type OffreEmploiItem = BaseOffreEmploi & {
  nomEntreprise: string
  localisation: string
  typeContrat: string
  duree: string
}

export type DetailOffreEmploi = BaseOffreEmploi & { urlPostulation: string }
