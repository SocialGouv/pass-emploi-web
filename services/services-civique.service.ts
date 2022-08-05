import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { ApiError } from 'utils/httpClient'

export interface ServicesCiviqueService {
  getLienServiceCivique(idOffreEngagement: string): Promise<string | undefined>
}
export class ServicesCiviqueApiService implements ServicesCiviqueService {
  constructor(private readonly apiClient: ApiClient) {}

  async getLienServiceCivique(
    idOffreEngagement: string
  ): Promise<string | undefined> {
    const session = await getSession()
    const accessToken = session!.accessToken

    try {
      const { content: serviceCiviqueJson } = await this.apiClient.get<{
        lienAnnonce: string
      }>(`/services-civique/${idOffreEngagement}`, accessToken)
      return serviceCiviqueJson.lienAnnonce
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }
      throw e
    }
  }
}
