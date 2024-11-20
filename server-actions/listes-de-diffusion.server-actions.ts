'use server'

import { getSession } from 'next-auth/react'

import { apiDelete, apiPost, apiPut } from 'clients/api.client'
import { LISTES_DIFFUSION_CACHE_TAG } from 'services/listes-de-diffusion.service'

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
    Object.values(LISTES_DIFFUSION_CACHE_TAG)
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
    Object.values(LISTES_DIFFUSION_CACHE_TAG)
  )
}

export async function supprimerListeDeDiffusion(
  idListe: string
): Promise<void> {
  const session = await getSession()

  await apiDelete('/listes-de-diffusion/' + idListe, session!.accessToken, [
    LISTES_DIFFUSION_CACHE_TAG.SINGLETON,
  ])
}
