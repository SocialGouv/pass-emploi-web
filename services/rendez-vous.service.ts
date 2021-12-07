import { RdvFormData } from 'interfaces/json/rdv'
import { ApiClient } from '../clients/api.client'

export class RendezVousService {
  constructor(private readonly apiClient: ApiClient) {}

  postNewRendezVous(
    idConseiller: string,
    newRDV: RdvFormData,
    accessToken: string
  ): Promise<Response> {
    return this.apiClient.post(
      `/conseillers/${idConseiller}/rendezvous`,
      newRDV,
      accessToken
    )
  }
}
