import { RdvFormData, RdvJson } from 'interfaces/json/rdv'
import { RdvJeune } from 'interfaces/rdv'
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

  getRendezVousConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<{ passes: RdvJson[]; futurs: RdvJson[] }> {
    return this.apiClient.get(
      `/conseillers/${idConseiller}/rendezvous`,
      accessToken
    )
  }

  getRendezVousJeune(
    idJeune: string,
    accessToken: string
  ): Promise<RdvJeune[]> {
    return this.apiClient.get(`/jeunes/${idJeune}/rendezvous`, accessToken)
  }

  async deleteRendezVous(
    idRendezVous: string,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.delete(`/rendezvous/${idRendezVous}`, accessToken)
  }
}
