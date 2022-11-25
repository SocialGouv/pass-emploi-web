import { DateTime } from 'luxon'

import { Agenda } from 'interfaces/agenda'

export const unAgenda = (overrides: Partial<Agenda> = {}): Agenda => {
  const agenda = {
    entrees: [],
    metadata: {
      dateDeDebut: DateTime.local(2022, 1, 1),
      dateDeFin: DateTime.local(2022, 1, 15),
      actionsEnRetard: '8',
    },
  }

  return { ...agenda, ...overrides }
}
