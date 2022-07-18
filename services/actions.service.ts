import { ApiClient } from 'clients/api.client'
import {
  Action,
  MetadonneesActions,
  StatutAction,
  TotalActions,
} from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'
import {
  ActionJson,
  ActionsCountJson,
  actionStatusToJson,
  jsonToAction,
  MetadonneesActionsJson,
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

  getActionsJeune(
    idJeune: string,
    options: { page: number; statuts: StatutAction[]; tri?: string },
    accessToken: string
  ): Promise<{ actions: Action[]; metadonnees: MetadonneesActions }>

  createAction(
    action: { intitule: string; commentaire: string },
    idConseiller: string,
    idJeune: string,
    accessToken: string
  ): Promise<void>

  updateAction(
    idAction: string,
    nouveauStatut: StatutAction,
    accessToken: string
  ): Promise<StatutAction>

  deleteAction(idAction: string, accessToken: string): Promise<void>
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

  async getActionsJeune(
    idJeune: string,
    {
      page,
      statuts,
      tri,
    }: { page: number; statuts: StatutAction[]; tri: string },
    accessToken: string
  ): Promise<{ actions: Action[]; metadonnees: MetadonneesActions }> {
    const triActions = tri ?? 'date_decroissante'
    const filtresStatuts = statuts
      .map((statut) => `&statuts=${actionStatusToJson(statut)}`)
      .join('')
    const url = `/v2/jeunes/${idJeune}/actions?page=${page}&tri=${triActions}${filtresStatuts}`

    const {
      content: { actions: actionsJson, metadonnees },
    } = await this.apiClient.get<{
      actions: ActionJson[]
      metadonnees: MetadonneesActionsJson
    }>(url, accessToken)

    const nombreActions =
      statuts.length === 0
        ? metadonnees.nombreTotal
        : calculeNombreActionsFiltrees(statuts, metadonnees)
    const nombrePages = Math.ceil(
      nombreActions / metadonnees.nombreActionsParPage
    )

    return {
      actions: actionsJson.map(jsonToAction),
      metadonnees: { nombreTotal: metadonnees.nombreTotal, nombrePages },
    }
  }

  async createAction(
    action: { intitule: string; commentaire: string },
    idConseiller: string,
    idJeune: string,
    accessToken: string
  ): Promise<void> {
    const payload = { content: action.intitule, comment: action.commentaire }
    await this.apiClient.post(
      `/conseillers/${idConseiller}/jeunes/${idJeune}/action`,
      payload,
      accessToken
    )
  }

  async updateAction(
    idAction: string,
    nouveauStatut: StatutAction,
    accessToken: string
  ): Promise<StatutAction> {
    await this.apiClient.put(
      `/actions/${idAction}`,
      { status: actionStatusToJson(nouveauStatut) },
      accessToken
    )
    return nouveauStatut
  }

  async deleteAction(idAction: string, accessToken: string): Promise<void> {
    await this.apiClient.delete(`/actions/${idAction}`, accessToken)
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
