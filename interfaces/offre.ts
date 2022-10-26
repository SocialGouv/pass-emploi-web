export enum TypeOffre {
  EMPLOI = 'EMPLOI',
  SERVICE_CIVIQUE = 'SERVICE_CIVIQUE',
  IMMERSION = 'IMMERSION',
  ALTERNANCE = 'ALTERNANCE',
}
export type BaseOffre = BaseOffreEmploi | BaseServiceCivique | BaseImmersion

export type BaseOffreEmploi = {
  type: TypeOffre.EMPLOI | TypeOffre.ALTERNANCE
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
  domaine: string

  ville?: string
  organisation?: string
  dateDeDebut?: string
}

export type DetailServiceCivique = BaseServiceCivique

export type BaseImmersion = {
  type: TypeOffre.IMMERSION
  id: string
  titre: string
  nomEtablissement: string
  ville: string
  secteurActivite: string
}

export interface MetadonneesOffres {
  nombrePages: number
  nombreTotal: number
}
