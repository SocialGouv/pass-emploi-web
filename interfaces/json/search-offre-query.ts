import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'

// TODO-1027 est-ce le bon endroit pour mettre ça ?
export function queryOffreEmploiToJsonString(
  query: SearchOffresEmploiQuery
): string {
  return JSON.stringify({ ...query })
}

export function jsonStringToQueryOffreEmploi(
  jsonString: string
): SearchOffresEmploiQuery {
  return { ...JSON.parse(jsonString) }
}
