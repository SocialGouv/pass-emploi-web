import { apiGet } from 'clients/api.client'
import { Offre, Recherche } from 'interfaces/favoris'
import {
  jsonToOffre,
  jsonToRecherche,
  OffreJson,
  RechercheJson,
} from 'interfaces/json/favoris'

export async function getOffres(
  idJeune: string,
  accessToken: string
): Promise<Offre[]> {
  const { content: offresJson } = await apiGet<OffreJson[]>(
    `/jeunes/${idJeune}/favoris`,
    accessToken
  )
  return offresJson.map(jsonToOffre)
}

export async function getRecherchesSauvegardees(
  idJeune: string,
  accessToken: string
): Promise<Recherche[]> {
  const { content: recherchesJson } = await apiGet<RechercheJson[]>(
    `/jeunes/${idJeune}/recherches`,
    accessToken
  )

  return recherchesJson.map(jsonToRecherche)
}
