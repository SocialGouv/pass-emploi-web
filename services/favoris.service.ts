import { getSession } from 'next-auth/react'

import { apiGet } from 'clients/api.client'
import { Offre } from 'interfaces/favoris'
import { jsonToOffre, OffreJson } from 'interfaces/json/favoris'
import { Periode } from 'types/dates'

export async function getOffres(
  idBeneficiaire: string,
  { debut, fin }: Periode
): Promise<Offre[]> {
  const session = await getSession()
  const dateDebutEncoded = encodeURIComponent(debut.toISO())
  const dateFinEncoded = encodeURIComponent(fin.toISO())

  const { content: offresJson } = await apiGet<OffreJson[]>(
    `/jeunes/${idBeneficiaire}/favoris?dateDebut=${dateDebutEncoded}&dateFin=${dateFinEncoded}`,
    session!.accessToken
  )
  return offresJson.map(jsonToOffre)
}
