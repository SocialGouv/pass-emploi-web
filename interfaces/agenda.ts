import { DateTime } from 'luxon'

import { StatutAction } from 'interfaces/action'

export type EntreeAgenda = {
  id: string
  type: 'action' | 'evenement'
  titre: string
  statut?: StatutAction
}

export type AgendaMetadata = {
  dateDeDebut: DateTime
  dateDeFin: DateTime
}
