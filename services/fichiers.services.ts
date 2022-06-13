import { ApiClient } from 'clients/api.client'
import { InfoFichier } from 'interfaces/fichier'

export interface FichiersService {
  uploadFichier(
    idJeunes: string[],
    fichier: File,
    accessToken: string
  ): Promise<InfoFichier | undefined>
}

export class FichiersApiService implements FichiersService {
  constructor(private readonly apiClient: ApiClient) {}

  async uploadFichier(
    idJeunes: string[],
    fichier: File,
    accessToken: string
  ): Promise<InfoFichier | undefined> {
    const formData = new FormData()
    idJeunes.forEach((idJeune) => {
      formData.append('jeunesIds', idJeune)
    })
    formData.append('fichier', fichier)

    return this.apiClient.postFile(`/fichiers`, formData, accessToken)
  }
}
