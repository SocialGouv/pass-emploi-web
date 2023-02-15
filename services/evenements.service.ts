import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import {
  AnimationCollective,
  Evenement,
  EvenementListItem,
  TypeEvenement,
} from 'interfaces/evenement'
import {
  AnimationCollectiveJson,
  EvenementFormData,
  EvenementJeuneJson,
  EvenementJson,
  jsonToAnimationCollective,
  jsonToEvenement,
  jsonToListItem,
} from 'interfaces/json/evenement'
import { ApiError } from 'utils/httpClient'

export interface EvenementsService {
  getRendezVousConseiller(
    idConseiller: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<EvenementListItem[]>
  getRendezVousJeune(
    idJeune: string,
    periode: string,
    accessToken: string
  ): Promise<EvenementListItem[]>

  getRendezVousEtablissement(
    idEtablissement: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<AnimationCollective[]>

  getRendezVousACloreClientSide(
    idEtablissement: string,
    page: number
  ): Promise<{
    animationsCollectives: any
    metadonneesAnimationsCollectives: any
  }>

  getRendezVousACloreServerSide(
    idEtablissement: string,
    accessToken: string
  ): Promise<{
    animationsCollectives: any
    metadonneesAnimationsCollectives: any
  }>

  getDetailsEvenement(
    idRdv: string,
    accessToken: string
  ): Promise<Evenement | undefined>

  getTypesRendezVous(accessToken: string): Promise<TypeEvenement[]>

  creerEvenement(newRDV: EvenementFormData): Promise<string>

  updateRendezVous(idRdv: string, updatedRdv: EvenementFormData): Promise<void>

  supprimerEvenement(idRendezVous: string): Promise<void>

  cloreAnimationCollective(
    idAnimationCollective: string,
    idsJeunes: string[]
  ): Promise<void>
}

export class EvenementsApiService implements EvenementsService {
  constructor(private readonly apiClient: ApiClient) {}

  async getRendezVousConseiller(
    idConseiller: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<EvenementListItem[]> {
    const session = await getSession()
    const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
    const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())
    const { content: rdvsJson } = await this.apiClient.get<EvenementJson[]>(
      `/v2/conseillers/${idConseiller}/rendezvous?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
      session!.accessToken
    )
    return rdvsJson.map(jsonToListItem)
  }

  async getRendezVousJeune(
    idJeune: string,
    periode: string,
    accessToken: string
  ): Promise<EvenementListItem[]> {
    const { content: rdvsJson } = await this.apiClient.get<
      EvenementJeuneJson[]
    >(`/jeunes/${idJeune}/rendezvous?periode=${periode}`, accessToken)

    return rdvsJson.map(jsonToListItem)
  }

  async getRendezVousEtablissement(
    idEtablissement: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<AnimationCollective[]> {
    const session = await getSession()
    const dateDebutUrlEncoded = encodeURIComponent(dateDebut.toISO())
    const dateFinUrlEncoded = encodeURIComponent(dateFin.toISO())
    const { content: animationsCollectivesJson } = await this.apiClient.get<
      AnimationCollectiveJson[]
    >(
      `/etablissements/${idEtablissement}/animations-collectives?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}`,
      session!.accessToken
    )

    return animationsCollectivesJson.map(jsonToAnimationCollective)
  }

  private async getRendezVousAClore(
    idEtablissement: string,
    page: number = 1,
    accessToken: string
  ): Promise<{
    animationsCollectives: any
    metadonneesAnimationsCollectives: any
  }> {
    const {
      content: { pagination, resultats },
    } = await this.apiClient.get<{
      pagination: { total: number; limit: number }
      resultats: any
    }>(
      `/v2/etablissements/${idEtablissement}/animations-collectives`,
      accessToken
    )

    const nombrePages = Math.ceil(pagination.total / pagination.limit)

    return {
      animationsCollectives: resultats,
      metadonneesAnimationsCollectives: {
        nombreTotal: pagination.total,
        nombrePages: nombrePages,
      },
    }
  }

  async getRendezVousACloreClientSide(
    idEtablissement: string,
    page: number
  ): Promise<{
    animationsCollectives: any
    metadonneesAnimationsCollectives: any
  }> {
    const session = await getSession()

    return this.getRendezVousAClore(idEtablissement, page, session!.accessToken)
  }

  getRendezVousACloreServerSide(
    idEtablissement: string,
    accessToken: string
  ): Promise<{
    animationsCollectives: any
    metadonneesAnimationsCollectives: any
  }> {
    return this.getRendezVousAClore(idEtablissement, 1, accessToken)
  }

  async getDetailsEvenement(
    idRdv: string,
    accessToken: string
  ): Promise<Evenement | undefined> {
    try {
      const { content: rdvJson } = await this.apiClient.get<EvenementJson>(
        `/rendezvous/${idRdv}`,
        accessToken
      )
      return jsonToEvenement(rdvJson)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }
      throw e
    }
  }

  async getTypesRendezVous(accessToken: string): Promise<TypeEvenement[]> {
    const { content: types } = await this.apiClient.get<TypeEvenement[]>(
      '/referentiels/types-rendezvous',
      accessToken
    )
    return types
  }

  async creerEvenement(newRDV: EvenementFormData): Promise<string> {
    const session = await getSession()
    const {
      content: { id },
    } = await this.apiClient.post<{ id: string }>(
      `/conseillers/${session!.user.id}/rendezvous`,
      newRDV,
      session!.accessToken
    )
    return id
  }

  async updateRendezVous(
    idRdv: string,
    updatedRdv: EvenementFormData
  ): Promise<void> {
    const { type, precision, invitation, ...payload } = updatedRdv
    const session = await getSession()
    await this.apiClient.put(
      `/rendezvous/${idRdv}`,
      payload,
      session!.accessToken
    )
  }

  async supprimerEvenement(idRendezVous: string): Promise<void> {
    const session = await getSession()
    await this.apiClient.delete(
      `/rendezvous/${idRendezVous}`,
      session!.accessToken
    )
  }

  async cloreAnimationCollective(
    idAnimationCollective: string,
    idsJeunes: string[]
  ): Promise<void> {
    const session = await getSession()
    const payload = { idsJeunes }
    await this.apiClient.post(
      `/etablissements/animations-collectives/${idAnimationCollective}/cloturer`,
      payload,
      session!.accessToken
    )
  }
}
