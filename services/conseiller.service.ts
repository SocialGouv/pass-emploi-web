import { ApiClient } from 'clients/api.client'
import { DossierMilo } from 'interfaces/jeune'

// FIXME : à déplacer dans JeunesService ?
export interface ConseillerService {
  getDossierJeune(
    idDossier: string,
    accessToken: string
  ): Promise<DossierMilo | undefined>

  createCompteJeuneMilo(
    newJeune: {
      idDossier: string
      nom: string
      prenom: string
      email: string | undefined
      idConseiller: string
    },
    accessToken: string
  ): Promise<{ id: string }>
}

export class ConseillerApiService implements ConseillerService {
  constructor(private readonly apiClient: ApiClient) {}

  getDossierJeune(
    idDossier: string,
    accessToken: string
  ): Promise<DossierMilo | undefined> {
    return this.apiClient.get<DossierMilo | undefined>(
      `/conseillers/milo/dossiers/${idDossier}`,
      accessToken
    )
  }

  createCompteJeuneMilo(
    newJeune: {
      idDossier: string
      nom: string
      prenom: string
      email: string | undefined
      idConseiller: string
    },
    accessToken: string
  ): Promise<{ id: string }> {
    return this.apiClient.post<{ id: string }>(
      `/conseillers/milo/jeunes`,
      newJeune,
      accessToken
    )
  }
}
