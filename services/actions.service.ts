import { ApiClient } from 'clients/api.client'
import { ActionJeune, StatutAction, TotalActions } from 'interfaces/action'
import { Jeune } from 'interfaces/jeune'
import {
  ActionJeuneJson,
  ActionsCountJson,
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
  ): Promise<TotalActions[]>

  getActionsJeune(idJeune: string, accessToken: string): Promise<ActionJeune[]>

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
  ): Promise<ActionJeune & { jeune: Jeune }> {
    const { jeune, ...actionJson } = await this.apiClient.get<
      ActionJeuneJson & { jeune: Jeune }
    >(`/actions/${idAction}`, accessToken)
    return { ...jsonToActionJeune(actionJson), jeune }
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
  ): Promise<ActionJeune[]> {
    const actionsJson = await this.apiClient.get<ActionJeuneJson[]>(
      `/jeunes/${idJeune}/actions`,
      accessToken
    )
    return actionsJson.map(jsonToActionJeune)
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
