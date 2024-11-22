import { getSession } from 'next-auth/react'

import { apiGet } from 'clients/api.client'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { CACHE_TAGS } from 'services/cache-tags'

// ******* TYPES *******
export type ListeDeDiffusionFormData = {
  titre: string
  idsBeneficiaires: string[]
}

export async function getListesDeDiffusionClientSide(): Promise<
  ListeDeDiffusion[]
> {
  const session = await getSession()
  return getListesDeDiffusion(session!.user.id, session!.accessToken)
}

export async function getListesDeDiffusionServerSide(
  idConseiller: string,
  accessToken: string
): Promise<ListeDeDiffusion[]> {
  return getListesDeDiffusion(idConseiller, accessToken)
}

export async function recupererListeDeDiffusion(
  id: string,
  accessToken: string
): Promise<ListeDeDiffusion> {
  const { content: listeDeDiffusion } = await apiGet<ListeDeDiffusion>(
    `/listes-de-diffusion/${id}`,
    accessToken,
    CACHE_TAGS.LISTE_DIFFUSION.SINGLETON
  )
  return listeDeDiffusion
}

// ******* PRIVATE *******
async function getListesDeDiffusion(
  idConseiller: string,
  accessToken: string
): Promise<ListeDeDiffusion[]> {
  const { content: listesDeDiffusion } = await apiGet<ListeDeDiffusion[]>(
    `/conseillers/${idConseiller}/listes-de-diffusion`,
    accessToken,
    CACHE_TAGS.LISTE_DIFFUSION.LISTE
  )
  return listesDeDiffusion
}
