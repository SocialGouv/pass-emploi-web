import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { ApiClient } from 'clients/api.client'
import { Agenda, AgendaMetadata, EntreeAgenda } from 'interfaces/agenda'
import { ActionJson, actionJsonToEntree } from 'interfaces/json/action'
import { EvenementJeuneJson, rdvJsonToEntree } from 'interfaces/json/evenement'
import { compareDates } from 'utils/date'

export interface AgendaService {
  recupererAgenda(idJeune: string, maintenant: DateTime): Promise<Agenda>
}

type DesRdvEtDesActions = {
  actions: ActionJson[]
  rendezVous: EvenementJeuneJson[]
  metadata: AgendaMetadataJson
}

type AgendaMetadataJson = {
  dateDeDebut: string
  dateDeFin: string
  actionsEnRetard: string
}

export class AgendaApiService implements AgendaService {
  constructor(private readonly apiClient: ApiClient) {}

  async recupererAgenda(
    idJeune: string,
    maintenant: DateTime
  ): Promise<Agenda> {
    const session = await getSession()
    const maintenantUrlEncode = encodeURIComponent(maintenant.toISO())

    const {
      content: { actions, rendezVous, metadata },
    } = await this.apiClient.get<DesRdvEtDesActions>(
      `/jeunes/${idJeune}/home/agenda?maintenant=${maintenantUrlEncode}`,
      session!.accessToken
    )

    return {
      entrees: fusionneEtTriActionsEtRendezVous(actions, rendezVous),
      metadata: jsonToMetadata(metadata),
    }
  }
}

function jsonToMetadata(json: AgendaMetadataJson): AgendaMetadata {
  return {
    dateDeDebut: DateTime.fromISO(json.dateDeDebut),
    dateDeFin: DateTime.fromISO(json.dateDeFin),
    actionsEnRetard: parseInt(json.actionsEnRetard),
  }
}

function fusionneEtTriActionsEtRendezVous(
  actions: ActionJson[],
  rendezVous: EvenementJeuneJson[]
): Array<EntreeAgenda> {
  const actionsTriables = actions.map((action) => ({
    ...actionJsonToEntree(action),
    datePourLeTri: DateTime.fromISO(action.dateEcheance),
  }))
  const rendezVousTriables = rendezVous.map((evenement) => ({
    ...rdvJsonToEntree(evenement),
    datePourLeTri: DateTime.fromISO(evenement.date),
  }))

  const result = [...actionsTriables, ...rendezVousTriables].sort(
    (first, second) => compareDates(first.datePourLeTri, second.datePourLeTri)
  )

  return result.map((actionOuRendezvousTriable) => {
    const { datePourLeTri, ...actionOuRendezvous } = actionOuRendezvousTriable
    return actionOuRendezvous
  })
}
