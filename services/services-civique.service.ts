import { getSession } from 'next-auth/react'

import { ApiClient } from '../clients/api.client'
import HttpClient from '../utils/httpClient'

export interface ServicesCiviqueService {
  getServiceCiviqueClient(idOffreEngagement: string): Promise<any>
}
export class ServicesCiviqueApiService implements ServicesCiviqueService {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly httpClient: HttpClient
  ) {}

  // TODO CHANGER LES ANY
  async getServiceCiviqueClient(idOffreEngagement: string): Promise<any> {
    const session = await getSession()
    const accessToken = session?.accessToken!

    const { content: serviceCiviqueJson } = await this.apiClient.get<any>(
      `/services-civique/${idOffreEngagement}`,
      accessToken
    )
    if (serviceCiviqueJson.lienAnnonce) {
      // return this.httpClient.fetchJson(
      // `/api/redirection/${serviceCiviqueJson.lienAnnonce}`
      // `${serviceCiviqueJson.lienAnnonce}`
      // )
      return serviceCiviqueJson.lienAnnonce
    }
    return serviceCiviqueJson
  }
}
