type BaseOffreEmploi = {
  id: string
  titre: string
}

export type OffreEmploiItem = BaseOffreEmploi & {
  nomEntreprise: string
  localisation: {
    nom: string
  }
  typeContrat: string
  duree: string
}

export type DetailOffreEmploi = BaseOffreEmploi & { urlPostulation: string }
