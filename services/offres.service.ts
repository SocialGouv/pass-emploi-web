import { getSession } from 'next-auth/react'

import { ApiClient } from '../clients/api.client'
import HttpClient from '../utils/httpClient'

export interface OffresEmploiService {
  getOffreEmploiClient(idOffreEmploi: string): Promise<any>
}
export class OffresEmploiApiService implements OffresEmploiService {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly httpClient: HttpClient
  ) {}

  // TODO CHANGER LES ANY
  async getOffreEmploiClient(idOffreEmploi: string): Promise<any> {
    const session = await getSession()
    const accessToken = session?.accessToken!

    const { content: offreEmploiJson } = await this.apiClient.get<any>(
      `/offres-emploi/${idOffreEmploi}`,
      accessToken
    )
    if (offreEmploiJson.urlRedirectPourPostulation) {
      //return this.httpClient.fetchJson(
      //`/api/redirection/${offreEmploiJson.urlRedirectPourPostulation}`
      //`${offreEmploiJson.urlRedirectPourPostulation}`
      //)
      return offreEmploiJson.urlRedirectPourPostulation
    }
    return offreEmploiJson
  }
}
