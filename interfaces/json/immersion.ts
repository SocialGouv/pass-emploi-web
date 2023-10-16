import { DetailImmersion, TypeOffre } from 'interfaces/offre'

export type ImmersionItemJson = {
  id: string
  metier: string
  nomEtablissement: string
  ville: string
  secteurActivite: string
}

export type DetailImmersionJson = {
  id: string
  metier: string
  nomEtablissement: string
  secteurActivite: string
  ville: string
  adresse: string
}

export function jsonToDetailImmersion(
  json: DetailImmersionJson
): DetailImmersion {
  return {
    type: TypeOffre.IMMERSION,
    id: json.id,
    titre: json.metier,
    nomEtablissement: json.nomEtablissement,
    ville: json.ville,
    secteurActivite: json.secteurActivite,
    contact: { adresse: json.adresse },
  }
}
