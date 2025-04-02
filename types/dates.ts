import { DateTime } from 'luxon'

export type Periode = { debut: DateTime; fin: DateTime; label: string }

export type JourSemaine = 1 | 2 | 3 | 4 | 5 | 6 | 7
