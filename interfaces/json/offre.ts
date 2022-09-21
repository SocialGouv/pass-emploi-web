import { DetailOffreEmploi } from 'interfaces/offre-emploi'

export type DetailOffreEmploiJson = {
  id: string
  urlRedirectPourPostulation: string
  data: { intitule: string }
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
