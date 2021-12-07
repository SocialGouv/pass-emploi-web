import { ApiClient } from 'clients/api.client'

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
}
