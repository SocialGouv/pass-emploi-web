import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

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
    accessToken
  )
  return listeDeDiffusion
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
    accessToken
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
    session!.accessToken
  )
}

export async function supprimerListeDeDiffusion(
  idListe: string
): Promise<void> {
  const session = await getSession()

  await apiDelete('/listes-de-diffusion/' + idListe, session!.accessToken)
}

async function getListesDeDiffusion(
  idConseiller: string,
  accessToken: string
): Promise<ListeDeDiffusion[]> {
  const { content: listesDeDiffusion } = await apiGet<ListeDeDiffusion[]>(
    `/conseillers/${idConseiller}/listes-de-diffusion`,
    accessToken
  )
  return listesDeDiffusion
}
