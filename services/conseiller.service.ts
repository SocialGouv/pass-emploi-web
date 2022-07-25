import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { Conseiller } from 'interfaces/conseiller'
import { DossierMilo } from 'interfaces/jeune'
import { ConseillerJson, jsonToConseiller } from 'interfaces/json/conseiller'
import { JeuneMiloFormData } from 'interfaces/json/jeune'
import { ApiError } from 'utils/httpClient'

export interface ConseillerService {
  getConseillerClientSide(): Promise<Conseiller | undefined>
  getConseillerServerSide(
    user: Session.HydratedUser,
    accessToken: string
  ): Promise<Conseiller | undefined>

  modifierAgence(agence: { id?: string; nom: string }): Promise<void>

  modifierNotificationsSonores(
    idConseiller: string,
    hasNotificationsSonores: boolean
  ): Promise<void>

  getDossierJeune(
    idDossier: string,
    accessToken: string
  ): Promise<DossierMilo | undefined>

  createCompteJeuneMilo(newJeune: JeuneMiloFormData): Promise<{ id: string }>

  recupererBeneficiaires(): Promise<void>
}

export class ConseillerApiService implements ConseillerService {
  constructor(private readonly apiClient: ApiClient) {}

  private async getConseiller(
    user: Session.HydratedUser,
    accessToken: string
  ): Promise<Conseiller | undefined> {
    try {
      const { content: conseillerJson } =
        await this.apiClient.get<ConseillerJson>(
          `/conseillers/${user.id}`,
          accessToken
        )

      return jsonToConseiller(conseillerJson, user)
    } catch (e) {
      if (e instanceof ApiError) {
        return undefined
      }
      throw e
    }
  }

  async getConseillerClientSide(): Promise<Conseiller | undefined> {
    const session = await getSession()
    return this.getConseiller(session!.user, session!.accessToken)
  }

  getConseillerServerSide(
    user: Session.HydratedUser,
    accessToken: string
  ): Promise<Conseiller | undefined> {
    return this.getConseiller(user, accessToken)
  }

  async modifierAgence({
    id,
    nom,
  }: {
    id?: string
    nom: string
  }): Promise<void> {
    const session = await getSession()
    const agence = id ? { id } : { nom }
    return this.apiClient.put(
      `/conseillers/${session!.user.id}`,
      { agence },
      session!.accessToken
    )
  }

  async modifierNotificationsSonores(
    idConseiller: string,
    hasNotificationsSonores: boolean
  ): Promise<void> {
    const session = await getSession()
    return this.apiClient.put(
      `/conseillers/${idConseiller}`,
      { notificationsSonores: hasNotificationsSonores },
      session!.accessToken
    )
  }

  async getDossierJeune(
    idDossier: string,
    accessToken: string
  ): Promise<DossierMilo | undefined> {
    const { content: dossier } = await this.apiClient.get<
      DossierMilo | undefined
    >(`/conseillers/milo/dossiers/${idDossier}`, accessToken)
    return dossier
  }

  async createCompteJeuneMilo(
    newJeune: JeuneMiloFormData
  ): Promise<{ id: string }> {
    const session = await getSession()
    const {
      content: { id },
    } = await this.apiClient.post<{ id: string }>(
      `/conseillers/milo/jeunes`,
      { ...newJeune, idConseiller: session!.user.id },
      session!.accessToken
    )
    return { id }
  }

  async recupererBeneficiaires(): Promise<void> {
    const session = await getSession()
    await this.apiClient.post(
      `/conseillers/${session!.user.id}/recuperer-mes-jeunes`,
      {},
      session!.accessToken
    )
  }
}
