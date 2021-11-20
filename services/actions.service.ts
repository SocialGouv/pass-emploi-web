import { ActionStatus } from '../interfaces/action'

export class ActionsService {
  private readonly apiPrefix?: string

  constructor () {
    this.apiPrefix = process.env.API_ENDPOINT
  }

  async updateAction (idAction: string, nouveauStatut: ActionStatus): Promise<ActionStatus> {
    await fetch(`${process.env.API_ENDPOINT}/actions/${idAction}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ status: nouveauStatut })
    })
    return nouveauStatut
  }

  deleteAction (idAction: string): Promise<Response> {
    return fetch(`${process.env.API_ENDPOINT}/actions/${idAction}`, {
      method: 'DELETE'
    })
  }
}