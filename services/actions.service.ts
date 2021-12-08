import { ApiClient } from 'clients/api.client'
import { Jeune } from 'interfaces'
import { ActionJeune, ActionStatus } from 'interfaces/action'

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

  getAction(
    idAction: string,
    accessToken: string
  ): Promise<ActionJeune & { jeune: Jeune }> {
    return this.apiClient.get(`/actions/${idAction}`, accessToken)
  }

  getActionsJeune(
    idJeune: string,
    accessToken: string
  ): Promise<ActionJeune[]> {
    return this.apiClient.get(`/jeunes/${idJeune}/actions`, accessToken)
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
      { status: nouveauStatut },
      accessToken
    )
    return nouveauStatut
  }

  async deleteAction(idAction: string, accessToken: string): Promise<void> {
    await this.apiClient.delete(`/actions/${idAction}`, accessToken)
  }
}
