import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

type ListeDeDiffusionFormData = {
  titre: string
  idsDestinataires: string[]
}

export interface ListesDeDiffusionService {
  getListesDeDiffusion(
    idConseiller: string,
    accessToken: string
  ): Promise<ListeDeDiffusion[]>

  creerListeDeDiffusion(nouvelleListe: ListeDeDiffusionFormData): Promise<void>
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

  async creerListeDeDiffusion({
    titre,
    idsDestinataires,
  }: ListeDeDiffusionFormData): Promise<void> {
    const session = await getSession()
    const { user, accessToken } = session!

    await this.apiClient.post(
      `/conseillers/${user.id}/listes-de-diffusion`,
      { titre, idsBeneficiaires: idsDestinataires },
      accessToken
    )
  }
}
