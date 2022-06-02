import { RdvFormData } from '../interfaces/json/rdv'

import { ApiClient } from 'clients/api.client'

export interface FilesService {
  postFile(
    idConseiller: string[],
    //TODO a re typer
    file: any,
    accessToken: string
  ): Promise<void>
}

export class FilesApiService implements FilesService {
  constructor(private readonly apiClient: ApiClient) {}

  postFile(
    idJeunes: string[],
    file: RdvFormData,
    accessToken: string
  ): Promise<void> {
    return this.apiClient.post(`/files`, file, accessToken)
  }
}
