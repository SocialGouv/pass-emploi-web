import { DetailOffreEmploi, BaseOffreEmploi } from 'interfaces/offre-emploi'

export type DetailOffreEmploiJson = {
  id: string
  urlRedirectPourPostulation: string
  data: {
    intitule: string
    entreprise: { nom: string }
    typeContrat: string
    typeContratLibelle: string
    dureeTravailLibelleConverti: string
    lieuTravail: { libelle: string }
    dateActualisation: string
    salaire: { commentaire: string }
    dureeTravailLibelle: string
    description: string
    experienceLibelle: string
    competences: Array<{ libelle: string }>
    qualitesProfessionnelles: Array<{ libelle: string }>
    formations: Array<{ commentaire: string; niveauLibelle: string }>
    langues: Array<{ libelle: string }>
    permis: Array<{ libelle: string }>
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
  return {
    id: id,
    titre: data.intitule,
    nomEntreprise: data.entreprise.nom,
    typeContrat: data.typeContrat,
    typeContratLibelle: data.typeContratLibelle,
    duree: data.dureeTravailLibelleConverti,
    localisation: data.lieuTravail.libelle,
    urlPostulation: urlRedirectPourPostulation,
    dateActualisation: data.dateActualisation,
    salaire: data.salaire.commentaire || '',
    horaires: data.dureeTravailLibelle,
    description: data.description,
    experiences: data.experienceLibelle,
    competences: data.competences.map((uneCompétence) => {
      return { libelle: uneCompétence.libelle }
    }),
    competencesProfessionnelles:
      data.qualitesProfessionnelles && data.qualitesProfessionnelles.length
        ? data.qualitesProfessionnelles.map((uneCompétencePro) => {
            return { libelle: uneCompétencePro.libelle }
          })
        : [],
    formations:
      data.formations && data.formations.length
        ? data.formations.map((uneFormation) => {
            return {
              libelle:
                uneFormation.commentaire + ' : ' + uneFormation.niveauLibelle,
            }
          })
        : [],
    langues:
      data.langues && data.langues.length
        ? data.langues.map((uneLangue) => {
            return { libelle: uneLangue.libelle }
          })
        : [],
    permis:
      data.permis && data.permis.length
        ? data.permis.map((unPermis) => {
            return { libelle: unPermis.libelle }
          })
        : [],
  }
}
