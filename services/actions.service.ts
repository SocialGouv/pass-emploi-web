import { ApiClient } from 'clients/api.client'
import {
  ActionJeune,
  ActionStatus,
  actionStatusToJson,
  jsonToActionStatus,
} from 'interfaces/action'
import { Jeune } from 'interfaces/jeune'
import { ActionJeuneJson } from 'interfaces/json/action'

export interface ActionsService {
  getAction(
    idAction: string,
    accessToken: string
  ): Promise<ActionJeune & { jeune: Jeune }>

  getActionsJeune(idJeune: string, accessToken: string): Promise<ActionJeune[]>

  createAction(
    newAction: { content: string; comment: string },
    idConseiller: string,
    idJeune: string,
    accessToken: string
  ): Promise<void>

  updateAction(
    idAction: string,
    nouveauStatut: ActionStatus,
    accessToken: string
  ): Promise<ActionStatus>

  deleteAction(idAction: string, accessToken: string): Promise<void>
}

export class ActionsApiService implements ActionsService {
  constructor(private readonly apiClient: ApiClient) {}

  async getAction(
    idAction: string,
    accessToken: string
  ): Promise<ActionJeune & { jeune: Jeune }> {
    const actionJson = await this.apiClient.get<
      ActionJeuneJson & { jeune: Jeune }
    >(`/actions/${idAction}`, accessToken)
    return { ...actionJson, status: jsonToActionStatus(actionJson.status) }
  }

  async getActionsJeune(
    idJeune: string,
    accessToken: string
  ): Promise<ActionJeune[]> {
    const actionsJson = await this.apiClient.get<ActionJeuneJson[]>(
      `/jeunes/${idJeune}/actions`,
      accessToken
    )
    return actionsJson.map((json) => ({
      ...json,
      status: jsonToActionStatus(json.status),
    }))
  }

  async createAction(
    newAction: { content: string; comment: string },
    idConseiller: string,
    idJeune: string,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.post(
      `/conseillers/${idConseiller}/jeunes/${idJeune}/action`,
      newAction,
      accessToken
    )
  }

  async updateAction(
    idAction: string,
    nouveauStatut: ActionStatus,
    accessToken: string
  ): Promise<ActionStatus> {
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
