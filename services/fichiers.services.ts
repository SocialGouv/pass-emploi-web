import { FichierResponse } from '../interfaces/json/fichier'

import { ApiClient } from 'clients/api.client'

export interface FichiersService {
  postFichier(
    idJeunes: string[],
    fichier: File,
    accessToken: string
  ): Promise<FichierResponse | undefined>
}

export class FichiersApiService implements FichiersService {
  constructor(private readonly apiClient: ApiClient) {}

  async postFichier(
    idJeunes: string[],
    fichier: File,
    accessToken: string
  ): Promise<FichierResponse | undefined> {
    const formData = new FormData()
    idJeunes.forEach((idJeune) => {
      formData.append('jeunesIds', idJeune)
    })
    formData.append('fichier', fichier)

    return this.apiClient.postFile(`/fichiers`, formData, accessToken)
  }
}
