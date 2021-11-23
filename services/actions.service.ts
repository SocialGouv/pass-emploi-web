import { Jeune } from 'interfaces'
import { ActionJeune, ActionStatus } from 'interfaces/action'
import fetchJson from 'utils/fetchJson'

export class ActionsService {
  private readonly apiPrefix?: string

  constructor () {
    this.apiPrefix = process.env.API_ENDPOINT
  }

  async getAction (idAction: string): Promise<ActionJeune & { jeune: Jeune }> {
    return fetchJson(
      `${this.apiPrefix}/actions/${idAction}`
    )
  }

  async updateAction (idAction: string, nouveauStatut: ActionStatus): Promise<ActionStatus> {
    await fetch(`${this.apiPrefix}/actions/${idAction}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ status: nouveauStatut })
    })
    return nouveauStatut
  }

  deleteAction (idAction: string): Promise<Response> {
    return fetch(`${this.apiPrefix}/actions/${idAction}`, {
      method: 'DELETE'
    })
  }
}