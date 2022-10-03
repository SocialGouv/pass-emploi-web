import { DetailOffreEmploi, BaseOffreEmploi } from 'interfaces/offre-emploi'

export type DetailOffreEmploiJson = {
  id: string
  urlRedirectPourPostulation: string
  data: {
    intitule: string
    entreprise?: {
      nom?: string
      description?: string
      url?: string
      entrepriseAdaptee?: boolean
    }
    typeContrat: string
    typeContratLibelle: string
    dureeTravailLibelleConverti: string
    lieuTravail: { libelle: string }
    dateActualisation: string
    salaire: { commentaire?: string }
    dureeTravailLibelle: string
    description: string
    experienceLibelle: string
    competences: Array<{ libelle: string }>
    qualitesProfessionnelles: Array<{ libelle: string }>
    formations: Array<{ commentaire: string; niveauLibelle: string }>
    langues: Array<{ libelle: string }>
    permis: Array<{ libelle: string }>
    accessibleTH?: boolean
  }
}

export type OffreEmploiItemJson = {
  id: string
  titre: string
  nomEntreprise: string
  localisation: {
    nom: string
  }
  typeContrat: string
  duree: string
}

export function jsonToOffreEmploiItem(
  offreEmploiItemJson: OffreEmploiItemJson
): BaseOffreEmploi {
  return {
    id: offreEmploiItemJson.id,
    titre: offreEmploiItemJson.titre,
    nomEntreprise: offreEmploiItemJson.nomEntreprise,
    typeContrat: offreEmploiItemJson.typeContrat,
    duree: offreEmploiItemJson.duree,
    localisation: offreEmploiItemJson.localisation.nom,
  }
}

export function jsonToDetailOffreEmploi(
  json: DetailOffreEmploiJson
): DetailOffreEmploi {
  const { id, data, urlRedirectPourPostulation } = json
  const offre: DetailOffreEmploi = {
    id: id,
    titre: data.intitule,
    nomEntreprise: data.entreprise?.nom ?? '',
    typeContrat: data.typeContrat,
    typeContratLibelle: data.typeContratLibelle,
    duree: data.dureeTravailLibelleConverti,
    localisation: data.lieuTravail.libelle,
    urlPostulation: urlRedirectPourPostulation,
    dateActualisation: data.dateActualisation,
    salaire: data.salaire.commentaire,
    horaires: data.dureeTravailLibelle,
    description: data.description,
    experience: data.experienceLibelle,
    competences: data.competences.map(({ libelle }) => libelle),
    competencesProfessionnelles:
      data.qualitesProfessionnelles && data.qualitesProfessionnelles.length
        ? data.qualitesProfessionnelles.map(({ libelle }) => libelle)
        : [],
    formations:
      data.formations && data.formations.length
        ? data.formations.map(
            (uneFormation) =>
              uneFormation.commentaire + ' : ' + uneFormation.niveauLibelle
          )
        : [],
    langues:
      data.langues && data.langues.length
        ? data.langues.map((uneLangue) => uneLangue.libelle)
        : [],
    permis:
      data.permis && data.permis.length
        ? data.permis.map((unPermis) => unPermis.libelle)
        : [],
    infoEntreprise: {},
  }

  if (data.entreprise?.description)
    offre.infoEntreprise.detail = data.entreprise.description
  if (data.entreprise?.url) offre.infoEntreprise.lien = data.entreprise.url
  if (data.entreprise?.entrepriseAdaptee !== undefined)
    offre.infoEntreprise.adaptee = data.entreprise.entrepriseAdaptee
  if (data.accessibleTH !== undefined)
    offre.infoEntreprise.accessibleTH = data.accessibleTH

  return offre
}
