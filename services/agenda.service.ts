import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { Action } from 'interfaces/action'
import { ActionJson, jsonToAction } from 'interfaces/json/action'
import { jsonToRdvListItem, RdvJson } from 'interfaces/json/rdv'
import { RdvListItem } from 'interfaces/rdv'

export interface AgendaService {
  recupererAgendaMilo(
    idJeune: string,
    maintenant: DateTime
  ): Promise<{
    actions: Action[]
    rendezVous: RdvListItem[]
    metadata: AgendaMetadata
  }>
}

type DesRdvEtDesActions = {
  actions: ActionJson[]
  rendezVous: RdvJson[]
  metadata: AgendaMetadataJson
}

export type AgendaMetadata = {
  actionsEnRetard: number
  dateDeDebut: DateTime
  dateDeFin: DateTime
}

type AgendaMetadataJson = {
  actionsEnRetard: number
  dateDeDebut: string
  dateDeFin: string
}

export class AgendaApiService implements AgendaService {
  constructor(private readonly apiClient: ApiClient) {}

  async recupererAgendaMilo(
    idJeune: string,
    maintenant: DateTime
  ): Promise<{
    actions: Action[]
    rendezVous: RdvListItem[]
    metadata: AgendaMetadata
  }> {
    const session = await getSession()
    const maintenantUrlEncode = encodeURIComponent(maintenant.toISO())

    const { content: desRdvEtDesActions } =
      await this.apiClient.get<DesRdvEtDesActions>(
        `/jeunes/${idJeune}/home/agenda?maintenant=${maintenantUrlEncode}`,
        session!.accessToken
      )

    return {
      actions: desRdvEtDesActions.actions.map(jsonToAction),
      rendezVous: desRdvEtDesActions.rendezVous.map(jsonToRdvListItem),
      metadata: jsonToMetadata(desRdvEtDesActions.metadata),
    }
  }
}

function jsonToMetadata(json: AgendaMetadataJson): AgendaMetadata {
  return {
    actionsEnRetard: json.actionsEnRetard,
    dateDeDebut: DateTime.fromISO(json.dateDeDebut),
    dateDeFin: DateTime.fromISO(json.dateDeFin),
  }
}
