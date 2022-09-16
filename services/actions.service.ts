import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import {
  Action,
  Commentaire,
  EtatQualificationAction,
  MetadonneesActions,
  QualificationAction,
  SituationNonProfessionnelle,
  StatutAction,
  TotalActions,
} from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'
import {
  ActionJson,
  ActionsCountJson,
  actionStatusToJson,
  CODE_QUALIFICATION_NON_SNP,
  CommentaireJson,
  etatQualificationActionToJson,
  jsonToAction,
  jsonToQualification,
  MetadonneesActionsJson,
  QualificationActionJson,
} from 'interfaces/json/action'
import { BaseJeuneJson, jsonToBaseJeune } from 'interfaces/json/jeune'
import { ApiError } from 'utils/httpClient'

export interface ActionsService {
  getAction(
    idAction: string,
    accessToken: string
  ): Promise<{ action: Action; jeune: BaseJeune } | undefined>

  countActionsJeunes(
    idConseiller: string,
    accessToken: string
  ): Promise<TotalActions[]>

  getActionsJeuneServerSide(
    idJeune: string,
    page: number,
    accessToken: string
  ): Promise<{ actions: Action[]; metadonnees: MetadonneesActions }>

  getActionsJeuneClientSide(
    idJeune: string,
    options: {
      page: number
      statuts: StatutAction[]
      etatsQualification: EtatQualificationAction[]
      tri?: string
    }
  ): Promise<{ actions: Action[]; metadonnees: MetadonneesActions }>

  createAction(
    action: { intitule: string; commentaire: string; dateEcheance: string },
    idJeune: string
  ): Promise<void>

  updateAction(
    idAction: string,
    nouveauStatut: StatutAction
  ): Promise<StatutAction>

  deleteAction(idAction: string): Promise<void>

  ajouterCommentaire(
    idAction: string,
    commentaire: string
  ): Promise<Commentaire>

  recupererLesCommentaires(
    idAction: string,
    accessToken: string
  ): Promise<Commentaire[]>

  qualifier(
    idAction: string,
    type: string,
    dateDebutModifiee?: DateTime,
    dateFinModifiee?: DateTime
  ): Promise<QualificationAction>

  getSituationsNonProfessionnelles(
    accessToken: string
  ): Promise<SituationNonProfessionnelle[]>
}

export class ActionsApiService implements ActionsService {
  constructor(private readonly apiClient: ApiClient) {}

  async getAction(
    idAction: string,
    accessToken: string
  ): Promise<{ action: Action; jeune: BaseJeune } | undefined> {
    try {
      const {
        content: { jeune, ...actionJson },
      } = await this.apiClient.get<ActionJson & { jeune: BaseJeuneJson }>(
        `/actions/${idAction}`,
        accessToken
      )
      return {
        action: jsonToAction(actionJson),
        jeune: jsonToBaseJeune(jeune),
      }
    } catch (e) {
      if (e instanceof ApiError) return undefined
      throw e
    }
  }

  async countActionsJeunes(
    idConseiller: string,
    accessToken: string
  ): Promise<TotalActions[]> {
    const { content: counts } = await this.apiClient.get<ActionsCountJson[]>(
      `/conseillers/${idConseiller}/actions`,
      accessToken
    )
    return counts.map((count: ActionsCountJson) => ({
      idJeune: count.jeuneId,
      nbActionsNonTerminees:
        count.todoActionsCount + count.inProgressActionsCount,
    }))
  }

  private async getActionsJeune(
    idJeune: string,
    {
      tri,
      statuts,
      etatsQualification,
      page,
    }: {
      page: number
      statuts: StatutAction[]
      etatsQualification: EtatQualificationAction[]
      tri?: string
    },
    accessToken: string
  ): Promise<{ actions: Action[]; metadonnees: MetadonneesActions }> {
    const triActions = tri ?? 'date_echeance_decroissante'
    const filtresStatuts = statuts
      .map((statut) => `&statuts=${actionStatusToJson(statut)}`)
      .join('')
    const filtresEtatsQualification = etatsQualification
      .map((etat) => `&etats=${etatQualificationActionToJson(etat)}`)
      .join('')
    const url = `/v2/jeunes/${idJeune}/actions?page=${page}&tri=${triActions}${filtresStatuts}${filtresEtatsQualification}`

    const {
      content: { actions: actionsJson, metadonnees },
    } = await this.apiClient.get<{
      actions: ActionJson[]
      metadonnees: MetadonneesActionsJson
    }>(url, accessToken)

    const nombreActions =
      statuts.length || etatsQualification.length
        ? calculeNombreActionsFiltrees(statuts, etatsQualification, metadonnees)
        : metadonnees.nombreTotal
    const nombrePages = Math.ceil(
      nombreActions / metadonnees.nombreActionsParPage
    )

    return {
      actions: actionsJson.map(jsonToAction),
      metadonnees: { nombreTotal: metadonnees.nombreTotal, nombrePages },
    }
  }

  async getActionsJeuneClientSide(
    idJeune: string,
    options: {
      page: number
      statuts: StatutAction[]
      etatsQualification: EtatQualificationAction[]
      tri?: string
    }
  ): Promise<{ actions: Action[]; metadonnees: MetadonneesActions }> {
    const session = await getSession()
    return this.getActionsJeune(idJeune, options, session!.accessToken)
  }

  getActionsJeuneServerSide(
    idJeune: string,
    page: number,
    accessToken: string
  ): Promise<{ actions: Action[]; metadonnees: MetadonneesActions }> {
    return this.getActionsJeune(
      idJeune,
      { page, statuts: [], etatsQualification: [] },
      accessToken
    )
  }

  async createAction(
    action: { intitule: string; commentaire: string; dateEcheance: string },
    idJeune: string
  ): Promise<void> {
    const session = await getSession()
    const payload = {
      content: action.intitule,
      comment: action.commentaire,
      dateEcheance: DateTime.fromISO(action.dateEcheance).toISO(),
    }
    await this.apiClient.post(
      `/conseillers/${session!.user.id}/jeunes/${idJeune}/action`,
      payload,
      session!.accessToken
    )
  }

  async updateAction(
    idAction: string,
    nouveauStatut: StatutAction
  ): Promise<StatutAction> {
    const session = await getSession()
    await this.apiClient.put(
      `/actions/${idAction}`,
      { status: actionStatusToJson(nouveauStatut) },
      session!.accessToken
    )
    return nouveauStatut
  }

  async qualifier(
    idAction: string,
    type: string,
    dateDebutModifiee?: DateTime,
    dateFinModifiee?: DateTime
  ): Promise<QualificationAction> {
    const session = await getSession()

    const payload: {
      codeQualification: string
      dateDebut?: string
      dateFinReelle?: string
    } = {
      codeQualification: type,
    }
    if (dateDebutModifiee) payload.dateDebut = dateDebutModifiee.toISO()
    if (dateFinModifiee) payload.dateFinReelle = dateFinModifiee.toISO()

    const { content } = await this.apiClient.post<QualificationActionJson>(
      `/actions/${idAction}/qualifier`,
      payload,
      session!.accessToken
    )
    return jsonToQualification(content)
  }

  async deleteAction(idAction: string): Promise<void> {
    const session = await getSession()
    await this.apiClient.delete(`/actions/${idAction}`, session!.accessToken)
  }

  async ajouterCommentaire(
    idAction: string,
    commentaire: string
  ): Promise<Commentaire> {
    const session = await getSession()
    const commentaireAjoute = await this.apiClient.post<CommentaireJson>(
      `/actions/${idAction}/commentaires`,
      { commentaire },
      session!.accessToken
    )
    return commentaireAjoute.content
  }

  async recupererLesCommentaires(
    idAction: string,
    accessToken: string
  ): Promise<Commentaire[]> {
    const commentairesJson = await this.apiClient.get<CommentaireJson[]>(
      `/actions/${idAction}/commentaires`,
      accessToken
    )
    return commentairesJson.content
  }

  async getSituationsNonProfessionnelles(
    accessToken: string
  ): Promise<SituationNonProfessionnelle[]> {
    const { content } = await this.apiClient.get<SituationNonProfessionnelle[]>(
      '/referentiels/qualifications-actions/types',
      accessToken
    )
    return content.filter(
      (situations) => situations.code !== CODE_QUALIFICATION_NON_SNP
    )
  }
}

function calculeNombreActionsFiltrees(
  statuts: StatutAction[],
  etatsQualification: EtatQualificationAction[],
  metadonnees: MetadonneesActionsJson
): number {
  let total = 0

  statuts.forEach((statut) => {
    total += extraireNombreActionsAvecStatut(metadonnees, statut)
  })
  etatsQualification.forEach((etatQualification) => {
    total += extraireNombreActionsAvecEtatQualification(
      metadonnees,
      etatQualification
    )
  })

  return total
}

function extraireNombreActionsAvecStatut(
  metadonnees: MetadonneesActionsJson,
  statut: StatutAction
): number {
  switch (statut) {
    case StatutAction.ARealiser:
      return metadonnees.nombrePasCommencees
    case StatutAction.Commencee:
      return metadonnees.nombreEnCours
    case StatutAction.Terminee:
      return metadonnees.nombreTerminees
    case StatutAction.Annulee:
      return metadonnees.nombreAnnulees
    default:
      return 0
  }
}

function extraireNombreActionsAvecEtatQualification(
  metadonnees: MetadonneesActionsJson,
  etatQualification: EtatQualificationAction
): number {
  switch (etatQualification) {
    case EtatQualificationAction.NonQualifiable:
      return metadonnees.nombreNonQualifiables
    case EtatQualificationAction.AQualifier:
      return metadonnees.nombreAQualifier
    case EtatQualificationAction.Qualifiee:
      return metadonnees.nombreQualifiees
    default:
      return 0
  }
}
