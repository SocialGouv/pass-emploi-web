import { jsonToRdv, RdvFormData, RdvJson } from 'interfaces/json/rdv'
import { Rdv, TypeRendezVous } from 'interfaces/rdv'
import { ApiClient } from 'clients/api.client'

export interface RendezVousService {
  postNewRendezVous(
    idConseiller: string,
    newRDV: RdvFormData,
    accessToken: string
  ): Promise<void>

  getRendezVousConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<{ passes: Rdv[]; futurs: Rdv[] }>

  getRendezVousJeune(idJeune: string, accessToken: string): Promise<Rdv[]>

  deleteRendezVous(idRendezVous: string, accessToken: string): Promise<void>

  getTypesRendezVous(accessToken: string): Promise<TypeRendezVous[]>
}
export class RendezVousApiService implements RendezVousService {
  constructor(private readonly apiClient: ApiClient) {}

  postNewRendezVous(
    idConseiller: string,
    newRDV: RdvFormData,
    accessToken: string
  ): Promise<void> {
    return this.apiClient.post(
      `/conseillers/${idConseiller}/rendezvous`,
      newRDV,
      accessToken
    )
  }

  async getRendezVousConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<{ passes: Rdv[]; futurs: Rdv[] }> {
    const { passes: rdvsPassesJson, futurs: rdvsFutursJson } =
      await this.apiClient.get<{
        passes: RdvJson[]
        futurs: RdvJson[]
      }>(`/conseillers/${idConseiller}/rendezvous`, accessToken)
    return {
      passes: rdvsPassesJson.map(jsonToRdv),
      futurs: rdvsFutursJson.map(jsonToRdv),
    }
  }

  async getRendezVousJeune(
    idJeune: string,
    accessToken: string
  ): Promise<Rdv[]> {
    const rdvsJson = await this.apiClient.get<RdvJson[]>(
      `/jeunes/${idJeune}/rendezvous`,
      accessToken
    )
    return rdvsJson.map(jsonToRdv)
  }

  async deleteRendezVous(
    idRendezVous: string,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.delete(`/rendezvous/${idRendezVous}`, accessToken)
  }

  getTypesRendezVous(accessToken: string): Promise<TypeRendezVous[]> {
    return this.apiClient.get<TypeRendezVous[]>(
      '/referentiels/types-rendezvous',
      accessToken
    )
  }
}
