import { DateTime } from 'luxon'

import { StatutAction } from 'interfaces/action'

export type Agenda = {
  entrees: EntreeAgenda[]
  metadata: AgendaMetadata
}

export type EntreeAgenda = {
  id: string
  date: DateTime
  type: 'action' | 'evenement'
  titre: string
  statut?: StatutAction
}

export type AgendaMetadata = {
  dateDeDebut: DateTime
  dateDeFin: DateTime
}
