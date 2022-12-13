import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

export type ListeDeDiffusionFormData = {
  titre: string
  idsBeneficiaires: string[]
}

export interface ListesDeDiffusionService {
  getListesDeDiffusionClientSide(): Promise<ListeDeDiffusion[]>

  getListesDeDiffusionServerSide(
    idConseiller: string,
    accessToken: string
  ): Promise<ListeDeDiffusion[]>

  recupererListeDeDiffusion(
    id: string,
    accessToken: string
  ): Promise<ListeDeDiffusion>

  creerListeDeDiffusion(nouvelleListe: ListeDeDiffusionFormData): Promise<void>

  modifierListeDeDiffusion(
    idListe: string,
    modifications: ListeDeDiffusionFormData
  ): Promise<void>

  supprimerListeDeDiffusion(idListe: string): Promise<void>
}

export class ListesDeDiffusionApiService implements ListesDeDiffusionService {
  constructor(private readonly apiClient: ApiClient) {}

  async getListesDeDiffusionClientSide (): Promise<ListeDeDiffusion[]> {
    const session = await getSession()
    return this.getListesDeDiffusion(session!.user.id, session!.accessToken)
  }

  async getListesDeDiffusionServerSide(
    idConseiller: string,
    accessToken: string
  ): Promise<ListeDeDiffusion[]> {
    return this.getListesDeDiffusion(idConseiller, accessToken)
  }

  async recupererListeDeDiffusion(
    id: string,
    accessToken: string
  ): Promise<ListeDeDiffusion> {
    const { content: listeDeDiffusion } =
      await this.apiClient.get<ListeDeDiffusion>(
        `/listes-de-diffusion/${id}`,
        accessToken
      )
    return listeDeDiffusion
  }

  async creerListeDeDiffusion({
    titre,
    idsBeneficiaires,
  }: ListeDeDiffusionFormData): Promise<void> {
    const session = await getSession()
    const { user, accessToken } = session!

    await this.apiClient.post(
      `/conseillers/${user.id}/listes-de-diffusion`,
      { titre, idsBeneficiaires },
      accessToken
    )
  }

  async modifierListeDeDiffusion(
    idListe: string,
    { titre, idsBeneficiaires }: ListeDeDiffusionFormData
  ): Promise<void> {
    const session = await getSession()

    await this.apiClient.put(
      '/listes-de-diffusion/' + idListe,
      { titre, idsBeneficiaires },
      session!.accessToken
    )
  }

  async supprimerListeDeDiffusion(idListe: string): Promise<void> {
    const session = await getSession()

    await this.apiClient.delete(
      '/listes-de-diffusion/' + idListe,
      session!.accessToken
    )
  }

  private async getListesDeDiffusion(
    idConseiller: string,
    accessToken: string
  ): Promise<ListeDeDiffusion[]> {
    const { content: listesDeDiffusion } = await this.apiClient.get<
      ListeDeDiffusion[]
    >(`/conseillers/${idConseiller}/listes-de-diffusion`, accessToken)
    return listesDeDiffusion
  }
}
