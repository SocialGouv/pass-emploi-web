export type BaseOffreEmploi = {
  id: string
  titre: string
  nomEntreprise: string
  localisation: string
  typeContrat: string
  duree: string
}

export type DetailOffreEmploi = BaseOffreEmploi & {
  typeContratLibelle: string
  dateActualisation: string
  description: string
  experience: string
  competences: string[]
  competencesProfessionnelles: string[]
  formations: string[]
  langues: string[]
  permis: string[]
  infoEntreprise: {
    detail?: string
    lien?: string
    adaptee?: boolean
    accessibleTH?: boolean
  }
  salaire?: string
  horaires?: string
}
