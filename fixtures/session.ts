import { DateTime } from 'luxon'

import { SessionMilo } from 'interfaces/session'

export function uneSessionMilo(
  overrides: Partial<SessionMilo> = {}
): SessionMilo {
  const defaults: SessionMilo = {
    id: 'id-session-1',
    nomSession: 'Nom session milo',
    nomOffre: 'Nom offre',
    dateHeureDebut: DateTime.fromISO('2021-10-21T10:00:00.000Z'),
    dateHeureFin: DateTime.fromISO('2021-10-21T10:00:00.000Z'),
    type: {
      code: 'WORKSHOP',
      label: 'Atelier i-milo',
    },
  }
  return { ...defaults, ...overrides }
}
