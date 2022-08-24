import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import {
  jsonToRdv,
  RdvFormData,
  RdvJeuneJson,
  rdvJeuneJsonToRdv,
  RdvJson,
} from 'interfaces/json/rdv'
import { Rdv, TypeRendezVous } from 'interfaces/rdv'
import { ApiError } from 'utils/httpClient'

export interface RendezVousService {
  getRendezVousConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Rdv[]>

  getRendezVousJeune(idJeune: string, accessToken: string): Promise<Rdv[]>

  getDetailsRendezVous(
    idRdv: string,
    accessToken: string
  ): Promise<Rdv | undefined>

  getTypesRendezVous(accessToken: string): Promise<TypeRendezVous[]>

  postNewRendezVous(newRDV: RdvFormData): Promise<void>

  updateRendezVous(idRdv: string, updatedRdv: RdvFormData): Promise<void>

  deleteRendezVous(idRendezVous: string): Promise<void>
}

export class RendezVousApiService implements RendezVousService {
  constructor(private readonly apiClient: ApiClient) {}

  async getRendezVousConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<Rdv[]> {
    const { content: rdvs } = await this.apiClient.get<RdvJson[]>(
      `/v2/conseillers/${idConseiller}/rendezvous`,
      accessToken
    )
    return rdvs.map(jsonToRdv)
  }

  async getRendezVousJeune(
    idJeune: string,
    accessToken: string
  ): Promise<Rdv[]> {
    const { content: rdvsJson } = await this.apiClient.get<RdvJeuneJson[]>(
      `/jeunes/${idJeune}/rendezvous`,
      accessToken
    )
    return rdvsJson.map(rdvJeuneJsonToRdv)
  }

  async getDetailsRendezVous(
    idRdv: string,
    accessToken: string
  ): Promise<Rdv | undefined> {
    try {
      const { content: rdvJson } = await this.apiClient.get<RdvJson>(
        `/rendezvous/${idRdv}`,
        accessToken
      )
      return jsonToRdv(rdvJson)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return undefined
      }
      throw e
    }
  }

  async getTypesRendezVous(accessToken: string): Promise<TypeRendezVous[]> {
    const { content: types } = await this.apiClient.get<TypeRendezVous[]>(
      '/referentiels/types-rendezvous',
      accessToken
    )
    return types
  }

  async postNewRendezVous(newRDV: RdvFormData): Promise<void> {
    const session = await getSession()
    await this.apiClient.post(
      `/conseillers/${session!.user.id}/rendezvous`,
      newRDV,
      session!.accessToken
    )
  }

  async updateRendezVous(
    idRdv: string,
    updatedRdv: RdvFormData
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
      comment: updatedRdv.comment,
    }
    await this.apiClient.put(
      `/rendezvous/${idRdv}`,
      payload,
      session!.accessToken
    )
  }

  async deleteRendezVous(idRendezVous: string): Promise<void> {
    const session = await getSession()
    await this.apiClient.delete(
      `/rendezvous/${idRendezVous}`,
      session!.accessToken
    )
  }
}
