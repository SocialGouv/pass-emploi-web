import { ApiClient } from 'clients/api.client'

export interface FilesService {
  postFile(
    idJeunes: string[],
    // file: string,
    file: File,
    accessToken: string
  ): Promise<void>
}

export class FilesApiService implements FilesService {
  constructor(private readonly apiClient: ApiClient) {}

  async postFile(
    idJeunes: string[],
    // file: string,
    file: File,
    accessToken: string
  ): Promise<void> {
    const formData = new FormData()
    idJeunes.forEach((idJeune) => {
      formData.append('jeunesIds', idJeune)
    })
    formData.append('fichier', file)

    // return this.apiClient.postFile(`/files`, formData, accessToken)

    console.log(formData)
    return this.apiClient.postFile(`/fichiers`, formData, accessToken)
  }
}
