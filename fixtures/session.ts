import { SessionJson } from 'interfaces/json/session'
import { Session } from 'interfaces/session'

export function unDetailSessionJson(
  overrides: Partial<SessionJson> = {}
): SessionJson {
  const defaults: SessionJson = {
    session: {
      id: 'session-1',
      nom: 'titre-session',
      dateHeureDebut: '2023-06-19 10:00:00',
      dateHeureFin: '2023-06-19 17:00:00',
      dateMaxInscription: '2023-06-17',
      animateur: 'Charles Dupont',
      lieu: 'CEJ Paris',
      nbPlacesDisponibles: 20,
      commentaire: 'bla',
    },
    offre: {
      id: '5522561',
      nom: 'aide',
      theme: 'Formation',
      type: {
        code: 'WORKSHOP',
        label: 'Atelier i-milo',
      },
      description: 'toto',
      nomPartenaire: '65-ML SUE',
    },
  }

  return { ...defaults, ...overrides }
}

export function unDetailSession(overrides: Partial<Session> = {}): Session {
  const defaults: Session = {
    session: {
      nom: 'titre-session',
      dateHeureDebut: '2023-06-19 10:00:00',
      dateHeureFin: '2023-06-19 17:00:00',
      dateMaxInscription: '2023-06-17',
      animateur: 'Charles Dupont',
      lieu: 'CEJ Paris',
      commentaire: 'bla',
    },
    offre: {
      titre: 'aide',
      theme: 'Formation',
      type: 'Atelier i-milo',
      description: 'toto',
      partenaire: '65-ML SUE',
    },
  }

  return { ...defaults, ...overrides }
}
