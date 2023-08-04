import { Session } from 'interfaces/session'
import { DetailsSessionJson } from 'interfaces/json/session'
import { StatutAnimationCollective } from 'interfaces/evenement'

export function unDetailSessionJson(
  overrides: Partial<DetailsSessionJson> = {}
): DetailsSessionJson {
  const defaults: DetailsSessionJson = {
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
      estVisible: true,
      statut: 'CLOTUREE',
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
    inscriptions: [
      {
        idJeune: 'jeune-1',
        nom: 'Beau',
        prenom: 'Harry',
        statut: 'INSCRIT',
      },
    ],
  }

  return { ...defaults, ...overrides }
}

export function unDetailSession(overrides: Partial<Session> = {}): Session {
  const defaults: Session = {
    session: {
      id: 'session-1',
      nom: 'titre-session',
      dateHeureDebut: '2023-06-19 10:00:00',
      dateHeureFin: '2023-06-19 17:00:00',
      dateMaxInscription: '2023-06-17',
      animateur: 'Charles Dupont',
      lieu: 'CEJ Paris',
      commentaire: 'bla',
      estVisible: true,
      nbPlacesDisponibles: 20,
      statut: StatutAnimationCollective.Close,
    },
    offre: {
      titre: 'aide',
      theme: 'Formation',
      type: 'Atelier i-milo',
      description: 'toto',
      partenaire: '65-ML SUE',
    },
    inscriptions: [
      {
        idJeune: 'jeune-1',
        nom: 'Beau',
        prenom: 'Harry',
        statut: 'INSCRIT',
      },
    ],
  }

  return { ...defaults, ...overrides }
}
