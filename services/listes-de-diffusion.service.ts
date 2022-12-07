import { ApiClient } from 'clients/api.client'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

export interface ListesDeDiffusionService {
  getListesDeDiffusion(
    idConseiller: string,
    accessToken: string
  ): Promise<ListeDeDiffusion[]>

  creerListe(): Promise<void>
}

export class ListesDeDiffusionApiService implements ListesDeDiffusionService {
  constructor(private readonly apiClient: ApiClient) {}

  async getListesDeDiffusion(
    idConseiller: string,
    accessToken: string
  ): Promise<ListeDeDiffusion[]> {
    const { content: listesDeDiffusion } = await this.apiClient.get<
      ListeDeDiffusion[]
    >(`/conseillers/${idConseiller}/listes-de-diffusion`, accessToken)
    return listesDeDiffusion
  }

  creerListe(): Promise<void> {
    throw new Error('not implemented')
  }
}
