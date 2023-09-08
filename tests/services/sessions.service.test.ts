import { DateTime } from 'luxon'

import { apiGet, apiPatch, apiPost } from 'clients/api.client'
import { unDetailSession, unDetailSessionJson } from 'fixtures/session'
import {
  AnimationCollective,
  EvenementListItem,
  StatutAnimationCollective,
} from 'interfaces/evenement'
import {
  SessionMiloBeneficiaireJson,
  SessionMiloJson,
} from 'interfaces/json/session'
import {
  changerInscriptionsSession,
  changerVisibiliteSession,
  cloreSession,
  getDetailsSession,
  getSessionsMiloBeneficiaire,
  getSessionsMissionLocaleClientSide,
} from 'services/sessions.service'
import { ApiError } from 'utils/httpClient'

jest.mock('clients/api.client')

describe('SessionsApiService', () => {
  describe('.getSessionsEtablissement', () => {
    it('renvoie les sessions milo d’une mission locale', async () => {
      // Given
      const dateDebut = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
      const dateFin = DateTime.fromISO('2022-09-07T23:59:59.999+02:00')
      const sessionsMiloJson: SessionMiloJson[] = [
        {
          id: 'id-session',
          nomSession: 'nom session',
          nomOffre: 'nom offre',
          dateHeureDebut: dateDebut.toISO(),
          dateHeureFin: dateFin.toISO(),
          estVisible: true,
          type: {
            code: 'COLLECTIVE_INFORMATION',
            label: 'info coll i-milo',
          },
          statut: 'CLOTUREE',
        },
        {
          id: 'id-session',
          nomSession: 'nom session',
          nomOffre: 'nom offre',
          dateHeureDebut: dateDebut.toISO(),
          dateHeureFin: dateFin.toISO(),
          estVisible: false,
          type: {
            code: 'WORKSHOP',
            label: 'Atelier i-milo',
          },
          statut: 'A_VENIR',
        },
      ]
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: sessionsMiloJson,
      })

      // When
      const actual = await getSessionsMissionLocaleClientSide(
        'id-conseiller',
        dateDebut,
        dateFin
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/conseillers/milo/id-conseiller/sessions?dateDebut=2022-09-01T00%3A00%3A00.000%2B02%3A00&dateFin=2022-09-07T23%3A59%3A59.999%2B02%3A00`,
        'accessToken'
      )
      const sessionsMilo: AnimationCollective[] = [
        {
          id: 'id-session',
          titre: 'nom offre',
          sousTitre: 'nom session',
          date: dateDebut,
          duree: 10079.999983333333,
          type: 'info coll i-milo',
          statut: StatutAnimationCollective.Close,
          isSession: true,
          estCache: false,
        },
        {
          id: 'id-session',
          titre: 'nom offre',
          sousTitre: 'nom session',
          date: dateDebut,
          duree: 10079.999983333333,
          type: 'Atelier i-milo',
          statut: StatutAnimationCollective.AVenir,
          isSession: true,
          estCache: true,
        },
      ]
      expect(actual).toEqual(sessionsMilo)
    })

    it("renvoie un tableau vide si les sessions n'existent pas", async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Sessions non trouvées')
      )
      const dateDebut = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
      const dateFin = DateTime.fromISO('2022-09-07T23:59:59.999+02:00')

      // When
      const actual = await getSessionsMissionLocaleClientSide(
        'id-conseiller',
        dateDebut,
        dateFin
      )

      // Then
      expect(actual).toEqual([])
    })
  })

  describe('.getDetailSession', () => {
    it('renvoie les détails de la session', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unDetailSessionJson(),
      })

      // When
      const actual = await getDetailsSession(
        'id-conseiller',
        'session-1',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/milo/id-conseiller/sessions/session-1',
        'accessToken'
      )
      expect(actual).toEqual(unDetailSession())
    })

    it("renvoie undefined si la session n'existe pas", async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Session non trouvée')
      )

      // When
      const actual = await getDetailsSession(
        'id-conseiller',
        'id-session',
        'accessToken'
      )

      // Then
      expect(actual).toEqual(undefined)
    })
  })

  describe('.changerVisibiliteSession', () => {
    it('modifie la visibilité de la session', async () => {
      // When
      await changerVisibiliteSession('idSession', true)

      // Then
      expect(apiPatch).toHaveBeenCalledWith(
        '/conseillers/milo/idConseiller/sessions/idSession',
        { estVisible: true },
        'accessToken'
      )
    })
  })

  describe('.changerInscriptionsSession', () => {
    it('modifie les informations de la session', async () => {
      // When
      await changerInscriptionsSession('idSession', [
        { commentaire: undefined, idJeune: 'jeune-id', statut: 'INSCRIT' },
      ])

      // Then
      expect(apiPatch).toHaveBeenCalledWith(
        '/conseillers/milo/idConseiller/sessions/idSession',
        {
          inscriptions: [
            { commentaire: undefined, idJeune: 'jeune-id', statut: 'INSCRIT' },
          ],
        },
        'accessToken'
      )
    })
  })
  describe('.cloreSession', () => {
    it('clôt une session', async () => {
      // Given
      const emargements = [
        { idJeune: 'id-jeune-1', statut: 'INSCRIT' },
        { idJeune: 'id-jeune-2', statut: 'REFUS_TIERS' },
      ]

      // When
      await cloreSession('id-conseiller', 'id-session', [
        { idJeune: 'id-jeune-1', statut: 'INSCRIT' },
        { idJeune: 'id-jeune-2', statut: 'REFUS_TIERS' },
      ])

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/milo/id-conseiller/sessions/id-session/cloturer',
        {
          emargements,
        },
        'accessToken'
      )
    })
  })
  describe('.getSessionsMiloJeune', () => {
    it('renvoie les sessions milo futures', async () => {
      // Given
      const accessToken = 'accessToken'
      const idJeune = 'id-jeune'
      const dateDebut = DateTime.fromISO('2022-09-01T11:00:00.000+02:00')
      const dateFin = DateTime.fromISO('2022-09-01T13:00:00.000+02:00')
      const sessionsMiloJeuneJson: SessionMiloBeneficiaireJson[] = [
        {
          id: '1',
          nomSession: 'Une-session',
          nomOffre: 'Une-offre',
          dateHeureDebut: '2022-09-01T11:00:00.000Z',
          dateHeureFin: '2022-09-01T13:00:00.000Z',
          type: {
            code: 'WORKSHOP',
            label: 'Atelier',
          },
          inscription: 'INSCRIT',
        },
      ]
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: sessionsMiloJeuneJson,
      })

      // When
      const actual = await getSessionsMiloBeneficiaire(
        'id-jeune',
        accessToken,
        dateDebut
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/jeunes/milo/${idJeune}/sessions?dateDebut=2022-09-01T11%3A00%3A00.000%2B02%3A00&filtrerEstInscrit=true`,
        accessToken
      )

      const sessionsMiloJeune: EvenementListItem[] = [
        {
          id: '1',
          type: 'Atelier i-milo',
          date: '2022-09-01T11:00:00.000Z',
          duree: 120,
          idCreateur: '1',
          isSession: true,
        },
      ]
      expect(actual).toEqual(sessionsMiloJeune)
    })
    it("renvoie un tableau vide si les sessions n'existent pas", async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Sessions non trouvées')
      )
      const dateDebut = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')

      // When
      const actual = await getSessionsMiloBeneficiaire(
        'id-jeune',
        'access-token',
        dateDebut
      )

      // Then
      expect(actual).toEqual([])
    })
  })
})
