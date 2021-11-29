import { RdvFormData } from '../interfaces/json/rdv'

export class RendezVousService {
  private readonly apiPrefix?: string

  constructor() {
    this.apiPrefix = process.env.API_ENDPOINT
  }

  postNewRendezVous(
    idConseiller: string,
    newRDV: RdvFormData
  ): Promise<Response> {
    return fetch(
      `${process.env.API_ENDPOINT}/conseillers/${idConseiller}/rendezvous`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(newRDV),
      }
    )
  }
}
