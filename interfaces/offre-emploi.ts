export type BaseOffreEmploi = {
  id: string
  titre: string
  nomEntreprise: string
  localisation: {
    nom: string
  }
  typeContrat: string
  duree: string
}

export type DetailOffreEmploi = BaseOffreEmploi & { urlPostulation: string }
