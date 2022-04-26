import { ApiClient } from 'clients/api.client'
import { Action, StatutAction, TotalActions } from 'interfaces/action'
import { Jeune } from 'interfaces/jeune'
import {
  ActionJson,
  ActionsCountJson,
  actionStatusToJson,
  jsonToAction,
} from 'interfaces/json/action'
import { RequestError } from 'utils/fetchJson'

export interface ActionsService {
  getAction(
    idAction: string,
    accessToken: string
  ): Promise<{ action: Action; jeune: Jeune } | undefined>

  countActionsJeunes(
    idConseiller: string,
    accessToken: string
  ): Promise<TotalActions[]>

  getActionsJeune(idJeune: string, accessToken: string): Promise<Action[]>

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
  ): Promise<{ action: Action; jeune: Jeune } | undefined> {
    try {
      const { jeune, ...actionJson } = await this.apiClient.get<
        ActionJson & { jeune: Jeune }
      >(`/actions/${idAction}`, accessToken)
      return { action: jsonToAction(actionJson), jeune }
    } catch (e) {
      if (e instanceof RequestError) return undefined
      throw e
    }
  }

  async countActionsJeunes(
    idConseiller: string,
    accessToken: string
  ): Promise<TotalActions[]> {
    const counts = await this.apiClient.get<ActionsCountJson[]>(
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
    accessToken: string
  ): Promise<Action[]> {
    const actionsJson = await this.apiClient.get<ActionJson[]>(
      `/jeunes/${idJeune}/actions`,
      accessToken
    )
    return actionsJson.map(jsonToAction)
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
