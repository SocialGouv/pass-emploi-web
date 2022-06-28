import { ApiClient } from 'clients/api.client'
import { Agence } from 'interfaces/conseiller'

export interface AgencesService {
  getAgences(structure: string, accessToken: string): Promise<Agence[]>
}

export class AgencesApiService implements AgencesService {
  constructor(private readonly apiClient: ApiClient) {}

  async getAgences(structure: string, accessToken: string): Promise<Agence[]> {
    const { content: agences } = await this.apiClient.get<Agence[]>(
      `/referentiels/agences?structure=${structure}`,
      accessToken
    )
    return agences
  }
}
