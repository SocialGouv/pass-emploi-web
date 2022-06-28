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
} from 'interfaces/json/action'
import { BaseJeuneJson, jsonToBaseJeune } from 'interfaces/json/jeune'
import { RequestError } from 'utils/httpClient'

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
    page: number,
    accessToken: string
  ): Promise<{ actions: Action[]; total: number }>

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
      if (e instanceof RequestError) return undefined
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
    page: number,
    accessToken: string
  ): Promise<{ actions: Action[]; total: number }> {
    const {
      content: {
        actions: actionsJson,
        metadonnees: { nombreTotal },
      },
    } = await this.apiClient.get<{
      actions: ActionJson[]
      metadonnees: MetadonneesActions
    }>(
      `/v2/jeunes/${idJeune}/actions?page=${page}&tri=date_decroissante`,
      accessToken
    )
    return {
      actions: actionsJson.map(jsonToAction),
      total: nombreTotal,
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
