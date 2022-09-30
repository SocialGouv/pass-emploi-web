import { DetailOffreEmploi, BaseOffreEmploi } from 'interfaces/offre-emploi'

export type DetailOffreEmploiJson = {
  id: string
  urlRedirectPourPostulation: string
  data: {
    intitule: string
    entreprise: { nom: string }
    typeContrat: string
    dureeTravailLibelleConverti: string
    lieuTravail: { libelle: string }
    dateActualisation: string
    salaire: { commentaire: string }
    dureeTravailLibelle: string
    description: string
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
    duree: data.dureeTravailLibelleConverti,
    localisation: data.lieuTravail.libelle,
    urlPostulation: urlRedirectPourPostulation,
    dateActualisation: data.dateActualisation,
    salaire: data.salaire.commentaire || '',
    horaires: data.dureeTravailLibelle,
    description: data.description,
  }
}
