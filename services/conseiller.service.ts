import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import { BaseConseiller, Conseiller } from 'interfaces/conseiller'
import { BaseJeune, DossierMilo } from 'interfaces/jeune'
import { ConseillerJson, jsonToConseiller } from 'interfaces/json/conseiller'
import { JeuneMiloFormData } from 'interfaces/json/jeune'
import { ApiError } from 'utils/httpClient'

export async function getConseillerClientSide(): Promise<
  Conseiller | undefined
> {
  const session = await getSession()
  return getConseiller(session!.user, session!.accessToken)
}

export async function getConseillerServerSide(
  user: Session.HydratedUser,
  accessToken: string
): Promise<Conseiller | undefined> {
  return getConseiller(user, accessToken)
}

export async function getConseillersEtablissementServerSide(
  accessToken: string,
  idAgence: string | undefined,
  user: Session.HydratedUser
): Promise<Conseiller[]> {
  try {
    const { content: conseillersJson } = await apiGet<ConseillerJson[]>(
      `/etablissements/${idAgence}/conseillers`,
      accessToken
    )

    return conseillersJson.map((conseiller) =>
      jsonToConseiller(conseiller, user)
    )
  } catch (e) {
    if (e instanceof ApiError) {
      return []
    }
    throw e
  }
}

export async function getConseillerByEmail(
  email: string
): Promise<BaseConseiller> {
  const session = await getSession()
  const {
    content: { id, firstName, lastName },
  } = await apiGet<ConseillerJson>(
    `/conseillers?email=${email}`,
    session!.accessToken
  )
  return { id, firstName, lastName }
}

export async function modifierAgence({
  id,
  nom,
}: {
  id?: string
  nom: string
}): Promise<void> {
  const session = await getSession()
  const agence = id ? { id } : { nom }
  return apiPut(
    `/conseillers/${session!.user.id}`,
    { agence },
    session!.accessToken
  )
}

export async function modifierNotificationsSonores(
  idConseiller: string,
  hasNotificationsSonores: boolean
): Promise<void> {
  const session = await getSession()
  return apiPut(
    `/conseillers/${idConseiller}`,
    { notificationsSonores: hasNotificationsSonores },
    session!.accessToken
  )
}

export async function getDossierJeune(
  idDossier: string,
  accessToken: string
): Promise<DossierMilo | undefined> {
  const { content: dossier } = await apiGet<DossierMilo | undefined>(
    `/conseillers/milo/dossiers/${idDossier}`,
    accessToken
  )
  return dossier
}

export async function createCompteJeuneMilo(
  newJeune: JeuneMiloFormData
): Promise<BaseJeune> {
  const session = await getSession()
  const { content } = await apiPost<BaseJeune>(
    `/conseillers/milo/jeunes`,
    { ...newJeune, idConseiller: session!.user.id },
    session!.accessToken
  )
  return content
}

export async function recupererBeneficiaires(): Promise<void> {
  const session = await getSession()
  await apiPost(
    `/conseillers/${session!.user.id}/recuperer-mes-jeunes`,
    {},
    session!.accessToken
  )
}

export async function supprimerConseiller(idConseiller: string): Promise<void> {
  const session = await getSession()
  await apiDelete(`/conseillers/${idConseiller}`, session!.accessToken)
}

async function getConseiller(
  user: Session.HydratedUser,
  accessToken: string
): Promise<Conseiller | undefined> {
  try {
    const { content: conseillerJson } = await apiGet<ConseillerJson>(
      `/conseillers/${user.id}`,
      accessToken
    )

    return jsonToConseiller(conseillerJson, user)
  } catch (e) {
    if (e instanceof ApiError) {
      return undefined
    }
    throw e
  }
}
