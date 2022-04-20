import { ApiClient } from 'clients/api.client'
import { ActionJeune, ActionsCount, ActionStatus } from 'interfaces/action'
import { Jeune } from 'interfaces/jeune'
import {
  ActionJeuneJson,
  actionStatusToJson,
  jsonToActionJeune,
} from 'interfaces/json/action'

export interface ActionsService {
  getAction(
    idAction: string,
    accessToken: string
  ): Promise<ActionJeune & { jeune: Jeune }>

  countActionsJeunes(
    idConseiller: string,
    accessToken: string
  ): Promise<ActionsCount[]>

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
    const { jeune, ...actionJson } = await this.apiClient.get<
      ActionJeuneJson & { jeune: Jeune }
    >(`/actions/${idAction}`, accessToken)
    return { ...jsonToActionJeune(actionJson), jeune }
  }

  async countActionsJeunes(
    idConseiller: string,
    accessToken: string
  ): Promise<ActionsCount[]> {
    return this.apiClient.get<ActionsCount[]>(
      `/conseillers/${idConseiller}/actions`,
      accessToken
    )
  }

  async getActionsJeune(
    idJeune: string,
    accessToken: string
  ): Promise<ActionJeune[]> {
    const actionsJson = await this.apiClient.get<ActionJeuneJson[]>(
      `/jeunes/${idJeune}/actions`,
      accessToken
    )
    return actionsJson.map(jsonToActionJeune)
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
