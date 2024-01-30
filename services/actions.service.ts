import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import {
  Action,
  ActionPilotage,
  Commentaire,
  QualificationAction,
  SituationNonProfessionnelle,
  StatutAction,
  TotalActions,
} from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'
import {
  ActionJson,
  ActionPilotageJson,
  ActionsCountJson,
  actionStatusToFiltre,
  actionStatusToJson,
  CODE_QUALIFICATION_NON_SNP,
  CommentaireJson,
  jsonToAction,
  jsonToActionPilotage,
  jsonToQualification,
  MetadonneesActionsJson,
  QualificationActionJson,
} from 'interfaces/json/action'
import { BaseJeuneJson, jsonToBaseJeune } from 'interfaces/json/jeune'
import { MetadonneesPagination } from 'types/pagination'
import { ApiError } from 'utils/httpClient'

export async function getAction(
  idAction: string,
  accessToken: string
): Promise<
  { action: Action; jeune: BaseJeune & { idConseiller: string } } | undefined
> {
  try {
    const {
      content: { jeune, ...actionJson },
    } = await apiGet<
      ActionJson & { jeune: BaseJeuneJson & { idConseiller: string } }
    >(`/actions/${idAction}`, accessToken)
    return {
      action: jsonToAction(actionJson),
      jeune: { ...jsonToBaseJeune(jeune), idConseiller: jeune.idConseiller },
    }
  } catch (e) {
    if (e instanceof ApiError) return undefined
    throw e
  }
}

export async function countActionsJeunes(
  idConseiller: string,
  accessToken: string
): Promise<TotalActions[]> {
  const { content: counts } = await apiGet<ActionsCountJson[]>(
    `/conseillers/${idConseiller}/actions`,
    accessToken
  )
  return counts.map((count: ActionsCountJson) => ({
    idJeune: count.jeuneId,
    nbActionsNonTerminees:
      count.todoActionsCount + count.inProgressActionsCount,
  }))
}

export async function getActionsJeuneClientSide(
  idJeune: string,
  options: {
    page: number
    statuts: StatutAction[]
    tri?: string
  }
): Promise<{ actions: Action[]; metadonnees: MetadonneesPagination }> {
  const session = await getSession()
  return getActionsJeune(idJeune, options, session!.accessToken)
}

export async function getActionsJeuneServerSide(
  idJeune: string,
  page: number,
  accessToken: string
): Promise<{ actions: Action[]; metadonnees: MetadonneesPagination }> {
  return getActionsJeune(idJeune, { page, statuts: [] }, accessToken)
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
  return getActionsAQualifier(idConseiller, { page: 1 }, accessToken)
}

export async function creerAction(
  action: {
    codeCategorie: string
    titre: string
    dateEcheance: string
    statut: StatutAction
    description?: string
  },
  idJeune: string
): Promise<void> {
  const session = await getSession()
  const payload = {
    content: action.titre,
    dateEcheance: DateTime.fromISO(action.dateEcheance).toISO(),
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
  modifications: {
    statut?: StatutAction
    titre?: string
    description?: string
    dateEcheance?: string
    dateFinReelle?: string
    codeCategorie?: string
  }
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
    dateDebutModifiee?: DateTime
    dateFinModifiee?: DateTime
    commentaire?: string
  }
): Promise<QualificationAction> {
  const session = await getSession()

  const payload: {
    codeQualification: string
    dateDebut?: string
    dateFinReelle?: string
    commentaireQualification?: string
  } = { codeQualification: type }

  if (options?.dateDebutModifiee)
    payload.dateDebut = options.dateDebutModifiee.toISO()
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

export async function ajouterCommentaire(
  idAction: string,
  commentaire: string
): Promise<Commentaire> {
  const session = await getSession()
  const commentaireAjoute = await apiPost<CommentaireJson>(
    `/actions/${idAction}/commentaires`,
    { commentaire },
    session!.accessToken
  )
  return commentaireAjoute.content
}

export async function recupererLesCommentaires(
  idAction: string,
  accessToken: string
): Promise<Commentaire[]> {
  const commentairesJson = await apiGet<CommentaireJson[]>(
    `/actions/${idAction}/commentaires`,
    accessToken
  )
  return commentairesJson.content
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

async function getActionsJeune(
  idJeune: string,
  {
    tri,
    statuts,
    page,
  }: {
    page: number
    statuts: StatutAction[]
    tri?: string
  },
  accessToken: string
): Promise<{ actions: Action[]; metadonnees: MetadonneesPagination }> {
  const triActions = tri ?? 'date_echeance_decroissante'
  const filtresStatuts = statuts
    .map((statut) => actionStatusToFiltre(statut))
    .join('')
  const url = `/v2/jeunes/${idJeune}/actions?page=${page}&tri=${triActions}${filtresStatuts}`

  const {
    content: { actions: actionsJson, metadonnees },
  } = await apiGet<{
    actions: ActionJson[]
    metadonnees: MetadonneesActionsJson
  }>(url, accessToken)

  const nombreActions = statuts.length
    ? calculeNombreActionsFiltrees(statuts, metadonnees)
    : metadonnees.nombreTotal
  const nombrePages = Math.ceil(
    nombreActions / metadonnees.nombreActionsParPage
  )

  return {
    actions: actionsJson.map(jsonToAction),
    metadonnees: { nombreTotal: metadonnees.nombreTotal, nombrePages },
  }
}

export type TriActionsAQualifier = 'ALPHABETIQUE' | 'INVERSE'
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

  if (tri) {
    queryParams.append(
      'tri',
      tri === 'ALPHABETIQUE'
        ? 'BENEFICIAIRE_ALPHABETIQUE'
        : 'BENEFICIAIRE_INVERSE'
    )
  }

  if (filtres) {
    filtres.forEach((filtre) => queryParams.append('codesCategories', filtre))
  }

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

function calculeNombreActionsFiltrees(
  statuts: StatutAction[],
  metadonnees: MetadonneesActionsJson
): number {
  let total = 0

  statuts.forEach((statut) => {
    total += extraireNombreActionsAvecStatut(metadonnees, statut)
  })

  return total
}

function extraireNombreActionsAvecStatut(
  metadonnees: MetadonneesActionsJson,
  statut: StatutAction
): number {
  switch (statut) {
    case StatutAction.EnCours:
      return metadonnees.nombrePasCommencees + metadonnees.nombreEnCours
    case StatutAction.Terminee:
      return metadonnees.nombreAQualifier
    case StatutAction.Qualifiee:
      return metadonnees.nombreQualifiees
    case StatutAction.Annulee:
      return metadonnees.nombreAnnulees
    default:
      return 0
  }
}
