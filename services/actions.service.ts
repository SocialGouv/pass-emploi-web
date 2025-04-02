import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import {
  Action,
  ActionPilotage,
  CompteurActionsPeriode,
  QualificationAction,
  SituationNonProfessionnelle,
} from 'interfaces/action'
import {
  ActionFormData,
  ActionJson,
  ActionPilotageJson,
  actionStatusToJson,
  CODE_QUALIFICATION_NON_SNP,
  CompteursPortefeuilleJson,
  jsonToAction,
  jsonToActionPilotage,
  jsonToQualification,
  QualificationActionJson,
} from 'interfaces/json/action'
import { Periode } from 'types/dates'
import { MetadonneesPagination } from 'types/pagination'
import { ApiError } from 'utils/httpClient'

export async function getAction(
  idAction: string,
  accessToken: string
): Promise<Action | undefined> {
  try {
    const { content: actionJson } = await apiGet<ActionJson>(
      `/actions/${idAction}`,
      accessToken
    )
    return jsonToAction(actionJson)
  } catch (e) {
    if (e instanceof ApiError) return undefined
    throw e
  }
}

export async function recupereCompteursBeneficiairesPortefeuilleMilo(
  idConseiller: string,
  dateDebut: DateTime,
  dateFin: DateTime,
  accessToken: string
): Promise<CompteurActionsPeriode[]> {
  const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
  const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())

  try {
    const { content: counts } = await apiGet<CompteursPortefeuilleJson[]>(
      `/conseillers/milo/${idConseiller}/compteurs-portefeuille?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
      accessToken
    )
    return counts.map(({ idBeneficiaire, actions, rdvs, sessions }) => {
      return {
        idBeneficiaire,
        actions,
        rdvs: Number(rdvs) + Number(sessions),
      }
    })
  } catch {
    return []
  }
}

export async function getActionsBeneficiaire(
  idJeune: string,
  { debut, fin }: Periode
): Promise<Action[]> {
  const session = await getSession()

  const dateDebutEncoded = encodeURIComponent(debut.toISO())
  const dateFinEncoded = encodeURIComponent(fin.toISO())
  const url = `/jeunes/${idJeune}/actions?dateDebut=${dateDebutEncoded}&dateFin=${dateFinEncoded}`

  const { content: actionsJson } = await apiGet<ActionJson[]>(
    url,
    session!.accessToken
  )

  return actionsJson.map(jsonToAction)
}

export async function getActionsAQualifierClientSide(
  idConseiller: string,
  options: { page: number; tri?: TriActionsAQualifier; filtres?: string[] }
): Promise<{
  actions: ActionPilotage[]
  metadonnees: MetadonneesPagination
}> {
  const session = await getSession()

  return getActionsAQualifier(idConseiller, options, session!.accessToken)
}

export async function getActionsAQualifierServerSide(
  idConseiller: string,
  accessToken: string
): Promise<{
  actions: ActionPilotage[]
  metadonnees: MetadonneesPagination
}> {
  return getActionsAQualifier(
    idConseiller,
    { page: 1, tri: 'REALISATION_CHRONOLOGIQUE' },
    accessToken
  )
}

export async function creerAction(
  action: ActionFormData,
  idJeune: string
): Promise<void> {
  const session = await getSession()
  const payload = {
    content: action.titre,
    dateEcheance: DateTime.fromISO(
      action.dateFinReelle ?? action.dateEcheance
    ).toISO(),
    codeQualification: action.codeCategorie,
    comment: action.description,
    status: actionStatusToJson(action.statut),
  }
  await apiPost(
    `/conseillers/${session!.user.id}/jeunes/${idJeune}/action`,
    payload,
    session!.accessToken
  )
}

export async function modifierAction(
  idAction: string,
  modifications: Partial<ActionFormData>
): Promise<void> {
  const session = await getSession()

  const actionModifiee = {
    status: modifications.statut
      ? actionStatusToJson(modifications.statut)
      : undefined,
    contenu: modifications.titre,
    description: modifications.description,
    dateEcheance: modifications.dateEcheance,
    dateFinReelle: modifications.dateFinReelle,
    codeQualification: modifications.codeCategorie,
  }

  await apiPut(`/actions/${idAction}`, actionModifiee, session!.accessToken)
}

export async function qualifier(
  idAction: string,
  type: string,
  options?: {
    dateFinModifiee?: DateTime
    commentaire?: string
  }
): Promise<QualificationAction> {
  const session = await getSession()

  const payload: {
    codeQualification: string
    dateFinReelle?: string
    commentaireQualification?: string
  } = { codeQualification: type }

  if (options?.dateFinModifiee)
    payload.dateFinReelle = options.dateFinModifiee.toISO()
  if (options?.commentaire)
    payload.commentaireQualification = options.commentaire

  const { content } = await apiPost<QualificationActionJson>(
    `/actions/${idAction}/qualifier`,
    payload,
    session!.accessToken
  )
  return jsonToQualification(content)
}

export async function qualifierActions(
  actions: Array<{ idAction: string; codeQualification: string }>,
  estSNP: boolean
): Promise<{ idsActionsEnErreur: string[] }> {
  const session = await getSession()
  const payload = { estSNP, qualifications: actions }

  const { content } = await apiPost<{ idsActionsEnErreur: string[] }>(
    '/conseillers/milo/actions/qualifier',
    payload,
    session!.accessToken
  )
  return content
}

export async function deleteAction(idAction: string): Promise<void> {
  const session = await getSession()
  await apiDelete(`/actions/${idAction}`, session!.accessToken)
}

export async function getSituationsNonProfessionnelles(
  { avecNonSNP }: { avecNonSNP: boolean },
  accessToken: string
): Promise<SituationNonProfessionnelle[]> {
  const { content } = await apiGet<SituationNonProfessionnelle[]>(
    '/referentiels/qualifications-actions/types',
    accessToken
  )
  return avecNonSNP
    ? content
    : content.filter(
        (categorie) => categorie.code !== CODE_QUALIFICATION_NON_SNP
      )
}

export type TriActionsAQualifier =
  | 'BENEFICIAIRE_ALPHABETIQUE'
  | 'BENEFICIAIRE_INVERSE'
  | 'REALISATION_CHRONOLOGIQUE'
  | 'REALISATION_ANTICHRONOLOGIQUE'

async function getActionsAQualifier(
  idConseiller: string,
  {
    page,
    tri,
    filtres,
  }: {
    page: number
    tri?: TriActionsAQualifier
    filtres?: string[]
  },
  accessToken: string
): Promise<{
  actions: ActionPilotage[]
  metadonnees: MetadonneesPagination
}> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    aQualifier: 'true',
  })

  if (tri) queryParams.append('tri', tri)

  if (filtres)
    filtres.forEach((filtre) => queryParams.append('codesCategories', filtre))

  const {
    content: { pagination, resultats },
  } = await apiGet<{
    pagination: { total: number; limit: number }
    resultats: ActionPilotageJson[]
  }>(`/v2/conseillers/${idConseiller}/actions?${queryParams}`, accessToken)

  const nombrePages = Math.ceil(pagination.total / pagination.limit)

  return {
    actions: resultats.map(jsonToActionPilotage),
    metadonnees: {
      nombreTotal: pagination.total,
      nombrePages: nombrePages,
    },
  }
}
