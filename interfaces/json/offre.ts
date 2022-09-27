import { DetailOffreEmploi, OffreEmploiItem } from 'interfaces/offre-emploi'

export type DetailOffreEmploiJson = {
  id: string
  urlRedirectPourPostulation: string
  data: { intitule: string }
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
): OffreEmploiItem {
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
  return {
    id: json.id,
    titre: json.data.intitule,
    urlPostulation: json.urlRedirectPourPostulation,
  }
}
