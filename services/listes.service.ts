import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import { Liste } from 'interfaces/liste'

export type ListeFormData = {
  titre: string
  idsBeneficiaires: string[]
}

export async function getListesClientSide(): Promise<Liste[]> {
  const session = await getSession()
  return getListes(session!.user.id, session!.accessToken)
}

export async function getListesServerSide(
  idConseiller: string,
  accessToken: string
): Promise<Liste[]> {
  return getListes(idConseiller, accessToken)
}

export async function recupererListe(
  id: string,
  accessToken: string
): Promise<Liste> {
  const { content: liste } = await apiGet<Liste>(
    `/listes-de-diffusion/${id}`,
    accessToken
  )
  return liste
}

export async function creerListe({
  titre,
  idsBeneficiaires,
}: ListeFormData): Promise<void> {
  const session = await getSession()
  const { user, accessToken } = session!

  await apiPost(
    `/conseillers/${user.id}/listes-de-diffusion`,
    { titre, idsBeneficiaires },
    accessToken
  )
}

export async function modifierListe(
  idListe: string,
  { titre, idsBeneficiaires }: ListeFormData
): Promise<void> {
  const session = await getSession()

  await apiPut(
    '/listes-de-diffusion/' + idListe,
    { titre, idsBeneficiaires },
    session!.accessToken
  )
}

export async function ajouterBeneficiaireAListe(
  idListe: string,
  idBeneficiaire: string,
  idConseiller: string
): Promise<void> {
  const session = await getSession()

  await apiPost(
    `/conseillers/${idConseiller}/listes-de-diffusion/${idListe}/jeunes/${idBeneficiaire}`,
    {},
    session!.accessToken
  )
}

export async function supprimerListe(idListe: string): Promise<void> {
  const session = await getSession()

  await apiDelete('/listes-de-diffusion/' + idListe, session!.accessToken)
}

async function getListes(
  idConseiller: string,
  accessToken: string
): Promise<Liste[]> {
  const { content: listes } = await apiGet<Liste[]>(
    `/conseillers/${idConseiller}/listes-de-diffusion`,
    accessToken
  )
  return listes
}
