import { apiGet } from 'clients/api.client'
import { MetadonneesFavoris } from 'interfaces/beneficiaire'
import { Offre, Recherche } from 'interfaces/favoris'
import {
  jsonToMetadonneesFavoris,
  MetadonneesFavorisJson,
} from 'interfaces/json/beneficiaire'
import {
  jsonToOffre,
  jsonToRecherche,
  OffreJson,
  RechercheJson,
} from 'interfaces/json/favoris'
import { ApiError } from 'utils/httpClient'

export async function getOffres(
  idJeune: string,
  accessToken: string
): Promise<Offre[]> {
  const { content: offresJson } = await apiGet<OffreJson[]>(
    `/jeunes/${idJeune}/favoris`,
    accessToken,
    'favoris'
  )
  return offresJson.map(jsonToOffre)
}

export async function getRecherchesSauvegardees(
  idJeune: string,
  accessToken: string
): Promise<Recherche[]> {
  const { content: recherchesJson } = await apiGet<RechercheJson[]>(
    `/jeunes/${idJeune}/recherches`,
    accessToken,
    'favoris'
  )

  return recherchesJson.map(jsonToRecherche)
}

export async function getMetadonneesFavorisJeune(
  idJeune: string,
  accessToken: string
): Promise<MetadonneesFavoris | undefined> {
  try {
    const { content: metadonneesFavoris } = await apiGet<{
      favoris: MetadonneesFavorisJson
    }>(`/jeunes/${idJeune}/favoris/metadonnees`, accessToken, 'favoris')
    return jsonToMetadonneesFavoris(metadonneesFavoris)
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) {
      return undefined
    }

    throw e
  }
}
