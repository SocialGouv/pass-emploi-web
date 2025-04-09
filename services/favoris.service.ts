import { apiGet } from 'clients/api.client'
import { Offre } from 'interfaces/favoris'
import { jsonToOffre, OffreJson } from 'interfaces/json/favoris'

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
