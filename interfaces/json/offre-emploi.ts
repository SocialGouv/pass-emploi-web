import {
  BaseOffreEmploi,
  DetailOffreEmploi,
  DetailOffreEmploiExperience,
  DetailOffreEmploiInfoEntreprise,
  TypeOffre,
} from 'interfaces/offre'

export type OffreEmploiItemJson = {
  id: string
  titre: string
  typeContrat: string

  alternance?: boolean
  duree?: string
  localisation?: { nom?: string }
  nomEntreprise?: string
}

export type DataDetailOffreEmploiJson = {
  intitule: string
  typeContrat: string
  typeContratLibelle: string

  accessibleTH?: boolean
  alternance?: boolean
  competences?: Array<{ libelle?: string }>
  dateCreation: string
  dateActualisation?: string
  description?: string
  dureeTravailLibelle?: string
  dureeTravailLibelleConverti?: string
  formations?: Array<{
    commentaire?: string
    domaineLibelle?: string
    niveauLibelle?: string
  }>
  entreprise?: {
    nom?: string
    description?: string
    url?: string
    entrepriseAdaptee?: boolean
  }
  experienceLibelle?: string
  experienceExige?: 'D' | 'S' | 'E'
  langues?: Array<{ libelle?: string }>
  lieuTravail?: { libelle?: string }
  permis?: Array<{ libelle?: string }>
  qualitesProfessionnelles?: Array<{ libelle?: string }>
  salaire?: { libelle?: string }
}

export type DetailOffreEmploiJson = {
  id: string
  urlRedirectPourPostulation?: string
  data: DataDetailOffreEmploiJson
  origine?: { nom: string; logo?: string }
}

export function jsonToOffreEmploiItem(
  json: OffreEmploiItemJson
): BaseOffreEmploi {
  const offreEmploiItem: BaseOffreEmploi = {
    type: json.alternance ? TypeOffre.ALTERNANCE : TypeOffre.EMPLOI,
    id: json.id,
    titre: json.titre,
    typeContrat: json.typeContrat,
  }

  if (json.nomEntreprise) offreEmploiItem.nomEntreprise = json.nomEntreprise
  if (json.duree) offreEmploiItem.duree = json.duree
  if (json.localisation?.nom)
    offreEmploiItem.localisation = json.localisation?.nom
  if (json.typeContrat === 'MIS') offreEmploiItem.typeContrat = 'Interim'

  return offreEmploiItem
}

export function jsonToDetailOffreEmploi(
  json: DetailOffreEmploiJson
): DetailOffreEmploi {
  const { id, data, urlRedirectPourPostulation, origine } = json

  const offre: DetailOffreEmploi = {
    type: json.data.alternance ? TypeOffre.ALTERNANCE : TypeOffre.EMPLOI,
    id: id,
    dateActualisation: data.dateActualisation ?? data.dateCreation,
    titre: data.intitule,
    typeContrat: data.typeContrat,
    typeContratLibelle: data.typeContratLibelle,
    competences: (data.competences ?? [])
      .map(({ libelle }) => libelle)
      .filter(isNotUndefined),
    competencesProfessionnelles: jsonToCompetencesProfessionnelles(data),
    formations: jsonToFormations(data),
    langues: jsonToLangues(data),
    permis: jsonToPermis(data),
    origine,
  }

  if (urlRedirectPourPostulation)
    offre.urlPostulation = urlRedirectPourPostulation

  if (data.description) offre.description = data.description

  if (data.salaire?.libelle) offre.salaire = data.salaire.libelle

  if (data.dureeTravailLibelleConverti)
    offre.duree = data.dureeTravailLibelleConverti
  if (data.dureeTravailLibelle) offre.horaires = data.dureeTravailLibelle

  if (data.lieuTravail?.libelle) offre.localisation = data.lieuTravail.libelle

  const experience = jsonToExperience(data)
  if (experience) offre.experience = experience

  if (data.entreprise?.nom) offre.nomEntreprise = data.entreprise.nom
  const infoEntreprise = jsonToInfoEntreprise(data)
  if (infoEntreprise) offre.infoEntreprise = infoEntreprise

  return offre
}

function jsonToFormations({ formations }: DataDetailOffreEmploiJson): string[] {
  return (formations ?? [])
    .map(({ niveauLibelle, commentaire, domaineLibelle }) => {
      let formation = niveauLibelle
      if (commentaire)
        formation = formation ? `${commentaire} : ${formation}` : commentaire
      if (domaineLibelle)
        formation = formation
          ? `${formation} (${domaineLibelle})`
          : domaineLibelle
      return formation
    })
    .filter(isNotUndefined)
}

function jsonToLangues({ langues }: DataDetailOffreEmploiJson): string[] {
  return (langues ?? []).map(({ libelle }) => libelle).filter(isNotUndefined)
}

function jsonToPermis({ permis }: DataDetailOffreEmploiJson): string[] {
  return (permis ?? []).map(({ libelle }) => libelle).filter(isNotUndefined)
}

function jsonToCompetencesProfessionnelles({
  qualitesProfessionnelles,
}: DataDetailOffreEmploiJson): string[] {
  return (qualitesProfessionnelles ?? [])
    .map(({ libelle }) => libelle)
    .filter(isNotUndefined)
}

function jsonToExperience({
  experienceLibelle,
  experienceExige,
}: DataDetailOffreEmploiJson): DetailOffreEmploiExperience | undefined {
  if (!experienceLibelle) return undefined
  const experience: DetailOffreEmploiExperience = { libelle: experienceLibelle }
  if (experienceExige) experience.exigee = experienceExige === 'E'
  return experience
}

function jsonToInfoEntreprise(
  data: DataDetailOffreEmploiJson
): DetailOffreEmploiInfoEntreprise | undefined {
  if (!data.entreprise) return undefined

  const infoEntreprise: DetailOffreEmploiInfoEntreprise = {}
  if (data.entreprise?.description)
    infoEntreprise.detail = data.entreprise.description
  if (data.entreprise?.url) infoEntreprise.lien = data.entreprise.url
  if (data.entreprise?.entrepriseAdaptee !== undefined)
    infoEntreprise.adaptee = data.entreprise.entrepriseAdaptee
  if (data.accessibleTH !== undefined)
    infoEntreprise.accessibleTH = data.accessibleTH

  if (!Object.entries(infoEntreprise).length) return undefined
  return infoEntreprise
}

function isNotUndefined(
  maybeUndefined: string | undefined
): maybeUndefined is string {
  return Boolean(maybeUndefined)
}
