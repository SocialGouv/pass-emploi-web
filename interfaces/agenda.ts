import { DateTime } from 'luxon'

import { StatutAction } from 'interfaces/action'

export type Agenda = {
  entrees: EntreeAgenda[]
  metadata: AgendaMetadata
}

export type EntreeAgenda = {
  id: string
  date: DateTime
  type: 'action' | 'evenement' | 'session'
  titre: string
  statut?: StatutAction
  source?: string
  typeSession?: 'info coll i-milo' | 'Atelier i-milo'
}

export type AgendaMetadata = {
  dateDeDebut: DateTime
  dateDeFin: DateTime
  actionsEnRetard: number
}
