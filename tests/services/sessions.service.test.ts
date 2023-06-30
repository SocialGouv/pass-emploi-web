import { DateTime } from 'luxon'

import { apiGet } from 'clients/api.client'
import { unDetailSession, unDetailSessionJson } from 'fixtures/session'
import { AnimationCollective } from 'interfaces/evenement'
import { SessionMiloJson } from 'interfaces/json/session'
import { getSessionsMissionLocale } from 'services/sessions.service'
import { getDetailsSession } from 'services/sessions.service'
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
          dateHeureDebut: dateDebut,
          dateHeureFin: dateFin,
          type: {
            code: 'COLLECTIVE_INFORMATION',
            label: 'info coll i-milo',
          },
          isSession: true,
        },
        {
          id: 'id-session',
          nomSession: 'nom session',
          nomOffre: 'nom offre',
          dateHeureDebut: dateDebut,
          dateHeureFin: dateFin,
          type: {
            code: 'WORKSHOP',
            label: 'Atelier i-milo',
          },
          isSession: true,
        },
      ]
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: sessionsMiloJson,
      })

      // When
      const actual = await getSessionsMissionLocale(
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
          statut: undefined,
          isSession: true,
        },
        {
          id: 'id-session',
          titre: 'nom offre',
          sousTitre: 'nom session',
          date: dateDebut,
          duree: 10079.999983333333,
          type: 'Atelier i-milo',
          statut: undefined,
          isSession: true,
        },
      ]
      expect(actual).toEqual(sessionsMilo)
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
        'id-session',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/milo/id-conseiller/sessions/id-session',
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
})
