export enum TypeOffre {
  EMPLOI = 'EMPLOI',
  SERVICE_CIVIQUE = 'SERVICE_CIVIQUE',
}
export type BaseOffre = BaseOffreEmploi | BaseServiceCivique

export type BaseOffreEmploi = {
  type: TypeOffre.EMPLOI
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
  dateActualisation: string
  formations: string[]
  langues: string[]
  permis: string[]
  typeContratLibelle: string

  description?: string
  experience?: DetailOffreEmploiExperience
  horaires?: string
  infoEntreprise?: DetailOffreEmploiInfoEntreprise
  urlPostulation?: string
  salaire?: string
}
export type DetailOffreEmploiExperience = { libelle: string; exigee?: boolean }

export type DetailOffreEmploiInfoEntreprise = {
  detail?: string
  lien?: string
  adaptee?: boolean
  accessibleTH?: boolean
}

export type BaseServiceCivique = {
  type: TypeOffre.SERVICE_CIVIQUE
  id: string
  titre: string
  domaine: string // TODO ou enum a voir,
  ville: string
  organisation: string
  dateDeDebut: string // todo formater 2022-02-15T10:12:14.000Z de dd mois AAAA
}
