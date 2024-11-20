import { DateTime } from 'luxon'
import { getSession } from 'next-auth/react'

import { apiGet } from 'clients/api.client'
import { Agenda, AgendaMetadata, EntreeAgenda } from 'interfaces/agenda'
import { ActionJson, actionJsonToEntree } from 'interfaces/json/action'
import { EvenementJeuneJson, rdvJsonToEntree } from 'interfaces/json/evenement'
import {
  sessionJsonToEntree,
  SessionMiloBeneficiaireJson,
} from 'interfaces/json/session'
import { compareDates } from 'utils/date'

type DesRdvEtDesActions = {
  actions: ActionJson[]
  rendezVous: EvenementJeuneJson[]
  sessionsMilo: SessionMiloBeneficiaireJson[]
  metadata: AgendaMetadataJson
}

type AgendaMetadataJson = {
  dateDeDebut: string
  dateDeFin: string
  actionsEnRetard: string
}

export async function recupererAgenda(
  idJeune: string,
  maintenant: DateTime
): Promise<Agenda> {
  const session = await getSession()
  const maintenantUrlEncode = encodeURIComponent(maintenant.toISO())

  const {
    content: { actions, rendezVous, sessionsMilo, metadata },
  } = await apiGet<DesRdvEtDesActions>(
    `/jeunes/${idJeune}/home/agenda?maintenant=${maintenantUrlEncode}`,
    session!.accessToken,
    'agenda'
  )

  return {
    entrees: fusionneEtTriActionsEtRendezVous(
      actions,
      rendezVous,
      sessionsMilo
    ),
    metadata: jsonToMetadata(metadata),
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
  rendezVous: EvenementJeuneJson[],
  sessionsMilo: SessionMiloBeneficiaireJson[]
): Array<EntreeAgenda> {
  const actionsTriables = actions.map((action) => ({
    ...actionJsonToEntree(action),
    datePourLeTri: DateTime.fromISO(action.dateEcheance),
  }))
  const rendezVousTriables = rendezVous.map((evenement) => ({
    ...rdvJsonToEntree(evenement),
    datePourLeTri: DateTime.fromISO(evenement.date),
  }))
  const sessionsMiloTriables = sessionsMilo.map((session) => ({
    ...sessionJsonToEntree(session),
    datePourLeTri: DateTime.fromISO(session.dateHeureFin),
  }))

  const result = [
    ...actionsTriables,
    ...rendezVousTriables,
    ...sessionsMiloTriables,
  ].sort((first, second) =>
    compareDates(first.datePourLeTri, second.datePourLeTri)
  )

  return result.map((actionSessionOuRdvTriable) => {
    const { datePourLeTri, ...actionSessionOuRdv } = actionSessionOuRdvTriable
    return actionSessionOuRdv
  })
}
