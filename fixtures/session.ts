import { StatutAnimationCollective } from 'interfaces/evenement'
import {
  DetailsSessionJson,
  SessionMiloBeneficiaireJson,
} from 'interfaces/json/session'
import { Session } from 'interfaces/session'
import { SessionsAClore } from 'services/sessions.service'

export function unDetailSessionJson(
  overrides: Partial<DetailsSessionJson> = {}
): DetailsSessionJson {
  const defaults: DetailsSessionJson = {
    session: {
      id: 'session-1',
      nom: 'titre-session',
      dateHeureDebut: '2023-06-19T10:00:00',
      dateHeureFin: '2023-06-19T17:00:00',
      dateMaxInscription: '2023-06-17',
      animateur: 'Charles Dupont',
      lieu: 'CEJ Paris',
      nbPlacesDisponibles: 20,
      commentaire: 'bla',
      estVisible: true,
      autoinscription: true,
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
        idJeune: 'beneficiaire-1',
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
      dateHeureDebut: '2023-06-19T10:00:00',
      dateHeureFin: '2023-06-19T17:00:00',
      animateur: 'Charles Dupont',
      lieu: 'CEJ Paris',
      commentaire: 'bla',
      estVisible: true,
      autoinscription: true,
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
        idJeune: 'beneficiaire-1',
        nom: 'Beau',
        prenom: 'Harry',
        statut: 'INSCRIT',
      },
    ],
  }

  return { ...defaults, ...overrides }
}

export const uneListeDeSessionsAClore = (): SessionsAClore[] => {
  return [
    {
      id: 'session-1',
      titre: 'Session 1',
      sousTitre: 'sous-titre de session 1',
      date: '05/05/2023',
    },
    {
      id: 'session-2',
      titre: 'Session 2',
      sousTitre: 'sous-titre de session 2',
      date: '06/05/2023',
    },
    {
      id: 'session-3',
      titre: 'Session 3',
      sousTitre: 'sous-titre de session 3',
      date: '07/05/2023',
    },
  ]
}

export const uneListeDESessionsMiloJson = (): SessionMiloBeneficiaireJson[] => {
  return [
    {
      id: 'session-1',
      nomSession: 'Workshop du 20 Octobre',
      nomOffre: 'Offre de la session 1',
      dateHeureDebut: '2021-10-20T10:00:00.000Z',
      dateHeureFin: '2021-10-20T10:00:00.000Z',
      type: {
        code: 'WORKSHOP',
        label: 'Atelier i-milo',
      },
      inscription: 'INSCRIT',
    },
    {
      id: 'session-2',
      nomSession: 'Info coll du 21 Octobre',
      nomOffre: 'Offre de la session 1',
      dateHeureDebut: '2021-10-21T10:00:00.000Z',
      dateHeureFin: '2021-10-21T10:00:00.000Z',
      type: {
        code: 'COLLECTIVE_INFORMATION',
        label: 'info coll i-milo',
      },
      inscription: 'INSCRIT',
    },
  ]
}
