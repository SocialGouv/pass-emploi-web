export type BaseOffreEmploi = {
  id: string
  titre: string
  typeContrat: string

  nomEntreprise?: string
  localisation?: string
  duree?: string
}

export type DetailOffreEmploi = BaseOffreEmploi & {
  competences: string[]
  competencesProfessionnelles: string[]
  formations: string[]
  langues: string[]
  permis: string[]
  typeContratLibelle: string

  dateActualisation?: string
  description?: string
  experience?: string
  horaires?: string
  infoEntreprise?: DetailOffreEmploiInfoEntreprise
  urlPostulation?: string
  salaire?: string
}

export type DetailOffreEmploiInfoEntreprise = {
  detail?: string
  lien?: string
  adaptee?: boolean
  accessibleTH?: boolean
}
