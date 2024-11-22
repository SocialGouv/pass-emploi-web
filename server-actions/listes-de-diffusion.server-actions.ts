'use server'

import { getSession } from 'next-auth/react'

import { apiDelete, apiPost, apiPut } from 'clients/api.client'
import { CACHE_TAGS } from 'services/cache-tags'

export type ListeDeDiffusionFormData = {
  titre: string
  idsBeneficiaires: string[]
}

export async function creerListeDeDiffusion({
  titre,
  idsBeneficiaires,
}: ListeDeDiffusionFormData): Promise<void> {
  const session = await getSession()
  const { user, accessToken } = session!

  await apiPost(
    `/conseillers/${user.id}/listes-de-diffusion`,
    { titre, idsBeneficiaires },
    accessToken,
    Object.values(CACHE_TAGS.LISTE_DIFFUSION)
  )
}

export async function modifierListeDeDiffusion(
  idListe: string,
  { titre, idsBeneficiaires }: ListeDeDiffusionFormData
): Promise<void> {
  const session = await getSession()

  await apiPut(
    '/listes-de-diffusion/' + idListe,
    { titre, idsBeneficiaires },
    session!.accessToken,
    Object.values(CACHE_TAGS.LISTE_DIFFUSION)
  )
}

export async function supprimerListeDeDiffusion(
  idListe: string
): Promise<void> {
  const session = await getSession()

  await apiDelete('/listes-de-diffusion/' + idListe, session!.accessToken, [
    CACHE_TAGS.LISTE_DIFFUSION.SINGLETON,
  ])
}
