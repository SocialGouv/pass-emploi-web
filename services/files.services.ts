import { FichierResponse } from '../interfaces/json/fichier'

import { ApiClient } from 'clients/api.client'

export interface FilesService {
  postFile(
    idJeunes: string[],
    file: File,
    accessToken: string
  ): Promise<FichierResponse | undefined>
}

export class FilesApiService implements FilesService {
  constructor(private readonly apiClient: ApiClient) {}

  async postFile(
    idJeunes: string[],
    file: File,
    accessToken: string
  ): Promise<FichierResponse | undefined> {
    const formData = new FormData()
    idJeunes.forEach((idJeune) => {
      formData.append('jeunesIds', idJeune)
    })
    formData.append('fichier', file)

    return this.apiClient.postFile(`/fichiers`, formData, accessToken)
  }
}
