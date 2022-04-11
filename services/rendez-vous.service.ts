import { ApiClient } from 'clients/api.client'
import { jsonToRdv, RdvFormData, RdvJson } from 'interfaces/json/rdv'
import { Rdv, TypeRendezVous } from 'interfaces/rdv'
import { RequestError } from '../utils/fetchJson'
import ErrorCodes from './error-codes'

export interface RendezVousService {
  getRendezVousConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<{ passes: Rdv[]; futurs: Rdv[] }>

  getRendezVousJeune(idJeune: string, accessToken: string): Promise<Rdv[]>

  getDetailsRendezVous(
    idRdv: string,
    accessToken: string
  ): Promise<Rdv | undefined>

  getTypesRendezVous(accessToken: string): Promise<TypeRendezVous[]>

  postNewRendezVous(
    idConseiller: string,
    newRDV: RdvFormData,
    accessToken: string
  ): Promise<void>

  updateRendezVous(
    idRdv: string,
    updatedRdv: RdvFormData,
    accessToken: string
  ): Promise<void>

  deleteRendezVous(idRendezVous: string, accessToken: string): Promise<void>
}

export class RendezVousApiService implements RendezVousService {
  constructor(private readonly apiClient: ApiClient) {}

  async getRendezVousConseiller(
    idConseiller: string,
    accessToken: string
  ): Promise<{ passes: Rdv[]; futurs: Rdv[] }> {
    const { passes: rdvsPassesJson, futurs: rdvsFutursJson } =
      await this.apiClient.get<{
        passes: RdvJson[]
        futurs: RdvJson[]
      }>(`/conseillers/${idConseiller}/rendezvous`, accessToken)
    return {
      passes: rdvsPassesJson.map(jsonToRdv),
      futurs: rdvsFutursJson.map(jsonToRdv),
    }
  }

  async getRendezVousJeune(
    idJeune: string,
    accessToken: string
  ): Promise<Rdv[]> {
    const rdvsJson = await this.apiClient.get<RdvJson[]>(
      `/jeunes/${idJeune}/rendezvous`,
      accessToken
    )
    return rdvsJson.map(jsonToRdv)
  }

  async getDetailsRendezVous(
    idRdv: string,
    accessToken: string
  ): Promise<Rdv | undefined> {
    try {
      const rdvJson = await this.apiClient.get<RdvJson>(
        `/rendezvous/${idRdv}`,
        accessToken
      )
      return jsonToRdv(rdvJson)
    } catch (e) {
      if (e instanceof RequestError && e.code === ErrorCodes.NON_TROUVE) {
        return undefined
      }
      throw e
    }
  }

  getTypesRendezVous(accessToken: string): Promise<TypeRendezVous[]> {
    return this.apiClient.get<TypeRendezVous[]>(
      '/referentiels/types-rendezvous',
      accessToken
    )
  }

  postNewRendezVous(
    idConseiller: string,
    newRDV: RdvFormData,
    accessToken: string
  ): Promise<void> {
    return this.apiClient.post(
      `/conseillers/${idConseiller}/rendezvous`,
      newRDV,
      accessToken
    )
  }

  updateRendezVous(
    idRdv: string,
    updatedRdv: RdvFormData,
    accessToken: string
  ): Promise<void> {
    const payload = {
      modality: updatedRdv.modality,
      date: updatedRdv.date,
      duration: updatedRdv.duration,
      adresse: updatedRdv.adresse,
      organisme: updatedRdv.organisme,
      presenceConseiller: updatedRdv.presenceConseiller,
      comment: updatedRdv.comment,
    }
    return this.apiClient.put(`/rendezvous/${idRdv}`, payload, accessToken)
  }

  async deleteRendezVous(
    idRendezVous: string,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.delete(`/rendezvous/${idRendezVous}`, accessToken)
  }
}
