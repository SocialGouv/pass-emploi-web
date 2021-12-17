import { ApiClient } from 'clients/api.client'
import { DossierMilo } from 'interfaces/jeune'

export class ConseillerService {
  constructor(private readonly apiClient: ApiClient) {}

  getDossierJeune(
    idDossier: string,
    accessToken: string
  ): Promise<DossierMilo | undefined> {
    return this.apiClient.get(
      `/conseillers/milo/dossiers/${idDossier}`,
      accessToken
    )
  }
}
