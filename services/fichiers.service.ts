import { ApiClient } from 'clients/api.client'
import { InfoFichier } from 'interfaces/fichier'

export interface FichiersService {
  uploadFichier(
    idJeunes: string[],
    fichier: File,
    accessToken: string
  ): Promise<InfoFichier>

  deleteFichier(idFichier: string, accessToken: string): Promise<void>
}

export class FichiersApiService implements FichiersService {
  constructor(private readonly apiClient: ApiClient) {}

  async uploadFichier(
    idJeunes: string[],
    fichier: File,
    accessToken: string
  ): Promise<InfoFichier> {
    const formData = new FormData()
    idJeunes.forEach((idJeune) => {
      formData.append('jeunesIds', idJeune)
    })
    formData.append('fichier', fichier)
    formData.append('nom', fichier.name)

    return this.apiClient.postFile(`/fichiers`, formData, accessToken)
  }

  async deleteFichier(idFichier: string, accessToken: string): Promise<void> {
    return this.apiClient.delete(`/fichiers/${idFichier}`, accessToken)
  }
}
