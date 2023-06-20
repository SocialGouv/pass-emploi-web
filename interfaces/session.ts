import { DateTime } from 'luxon'

export type SessionMilo = {
  id: string
  nomSession: string
  nomOffre: string
  dateHeureDebut: DateTime
  dateHeureFin: DateTime
  type: string
}
