import { ApiClient } from 'clients/api.client'
import { UserStructure } from 'interfaces/conseiller'

export class MessagesService {
  constructor(private readonly apiClient: ApiClient) {}

  async notifierNouveauMessage(
    idConseiller: string,
    idJeune: string,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.post(
      `/conseillers/${idConseiller}/jeunes/${idJeune}/notify-message`,
      undefined,
      accessToken
    )
  }

  async evenementNouveauMessage(
    structure: string,
    idConseiller: string,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.post(
      '/evenements',
      {
        type: 'MESSAGE_ENVOYE',
        emetteur: {
          type: 'CONSEILLER',
          structure: structure,
          id: idConseiller,
        },
      },
      accessToken
    )
  }
}
