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
  jsonToListItem,
  jsonToEvenement,
  EvenementFormData,
  EvenementJeuneJson,
  evenementJeuneJsonToListItem,
  EvenementJson,
  jsonToAnimationCollective,
  AnimationCollectiveJson,
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

  getDetailsEvenement(
    idRdv: string,
    accessToken: string
  ): Promise<Evenement | undefined>

  getTypesRendezVous(accessToken: string): Promise<TypeEvenement[]>

  creerEvenement(newRDV: EvenementFormData): Promise<void>

  updateRendezVous(idRdv: string, updatedRdv: EvenementFormData): Promise<void>

  deleteEvenement(idRendezVous: string): Promise<void>
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
    return rdvsJson.map(evenementJeuneJsonToListItem)
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

  async getDetailsEvenement(
    idRdv: string,
    accessToken: string
  ): Promise<Evenement | undefined> {
    try {
      const { content: rdvJson } = await this.apiClient.get<EvenementJson>(
        `/rendezvous/${idRdv}?avecHistorique=true`,
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

  async creerEvenement(newRDV: EvenementFormData): Promise<void> {
    const session = await getSession()
    await this.apiClient.post(
      `/conseillers/${session!.user.id}/rendezvous`,
      newRDV,
      session!.accessToken
    )
  }

  async updateRendezVous(
    idRdv: string,
    updatedRdv: EvenementFormData
  ): Promise<void> {
    const session = await getSession()
    const payload = {
      jeunesIds: updatedRdv.jeunesIds,
      modality: updatedRdv.modality,
      date: updatedRdv.date,
      duration: updatedRdv.duration,
      adresse: updatedRdv.adresse,
      organisme: updatedRdv.organisme,
      presenceConseiller: updatedRdv.presenceConseiller,
      titre: updatedRdv.titre,
      comment: updatedRdv.comment,
    }
    await this.apiClient.put(
      `/rendezvous/${idRdv}`,
      payload,
      session!.accessToken
    )
  }

  async deleteEvenement(idRendezVous: string): Promise<void> {
    const session = await getSession()
    await this.apiClient.delete(
      `/rendezvous/${idRendezVous}`,
      session!.accessToken
    )
  }
}
