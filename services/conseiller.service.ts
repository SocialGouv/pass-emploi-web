import { ApiClient } from 'clients/api.client'

interface Dossier {
  id: string
  prenom: string
  nom: string
  dateDeNaissance: string
  email?: string
}

export class MiloService {
  constructor(private readonly apiClient: ApiClient) {}

  getDossier(
    idDossier: string,
    accessToken: string
  ): Promise<Dossier | undefined> {
    return this.apiClient.get(
      `conseillers/milo/dossiers/${idDossier}`,
      accessToken
    )
  }
}
