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
  SessionMiloBeneficiairesJson,
  SessionMiloJson,
} from 'interfaces/json/session'
import {
  configurerSession,
  changerInscriptionsSession,
  cloreSession,
  getDetailsSession,
  getSessionsBeneficiaires,
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
          autoinscription: true,
          type: {
            code: 'COLLECTIVE_INFORMATION',
            label: 'info coll i-milo',
          },
          statut: 'CLOTUREE',
          nombreParticipants: 2,
        },
        {
          id: 'id-session',
          nomSession: 'nom session',
          nomOffre: 'nom offre',
          dateHeureDebut: dateDebut.toISO(),
          dateHeureFin: dateFin.toISO(),
          estVisible: false,
          autoinscription: false,
          type: {
            code: 'WORKSHOP',
            label: 'Atelier i-milo',
          },
          statut: 'A_VENIR',
          nombreParticipants: 4,
        },
      ]
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: sessionsMiloJson,
      })

      // When
      const actual = await getSessionsMissionLocaleClientSide(
        'id-conseiller-1',
        dateDebut,
        dateFin
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/conseillers/milo/id-conseiller-1/sessions?dateDebut=2022-09-01T00%3A00%3A00.000%2B02%3A00&dateFin=2022-09-07T23%3A59%3A59.999%2B02%3A00`,
        'accessToken'
      )
      const sessionsMilo: AnimationCollective[] = [
        {
          id: 'id-session',
          titre: 'nom offre',
          sousTitre: 'nom session',
          date: dateDebut,
          duree: 10080,
          type: 'info coll i-milo',
          statut: StatutAnimationCollective.Close,
          isSession: true,
          etatVisibilite: 'auto-inscription',
          nombreParticipants: 2,
        },
        {
          id: 'id-session',
          titre: 'nom offre',
          sousTitre: 'nom session',
          date: dateDebut,
          duree: 10080,
          type: 'Atelier i-milo',
          statut: StatutAnimationCollective.AVenir,
          isSession: true,
          etatVisibilite: 'non-visible',
          nombreParticipants: 4,
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
        'id-conseiller-1',
        dateDebut,
        dateFin
      )

      // Then
      expect(actual).toEqual([])
    })
  })

  describe('.getSessionsBeneficiaires', () => {
    it('renvoie les sessions milo auxquelles participent les bénéficiaires du conseiller', async () => {
      // Given
      const dateDebut = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
      const dateFin = DateTime.fromISO('2022-09-07T23:59:59.999+02:00')
      const sessionsMiloJson: SessionMiloBeneficiairesJson[] = [
        {
          id: 'id-session',
          nomSession: 'nom session',
          nomOffre: 'nom offre',
          dateHeureDebut: dateDebut.toISO(),
          dateHeureFin: dateFin.toISO(),
          type: {
            code: 'COLLECTIVE_INFORMATION',
            label: 'info coll i-milo',
          },
          beneficiaires: [
            {
              idJeune: 'id-beneficiaire',
              nom: 'Granger',
              prenom: 'Hermione',
              statut: 'INSCRIT',
            },
          ],
        },
        {
          id: 'id-session-2',
          nomSession: 'nom session 2',
          nomOffre: 'nom offre 2',
          dateHeureDebut: dateDebut.toISO(),
          dateHeureFin: dateFin.toISO(),
          type: {
            code: 'WORKSHOP',
            label: 'Atelier i-milo',
          },
          beneficiaires: [
            {
              idJeune: 'id-beneficiaire',
              nom: 'Granger',
              prenom: 'Hermione',
              statut: 'INSCRIT',
            },
            {
              idJeune: 'id-beneficiaire-2',
              nom: 'Potter',
              prenom: 'Harry',
              statut: 'INSCRIT',
            },
          ],
        },
      ]
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: sessionsMiloJson,
      })

      // When
      const actual = await getSessionsBeneficiaires(
        'id-conseiller-1',
        dateDebut,
        dateFin
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/conseillers/milo/id-conseiller-1/agenda/sessions?dateDebut=2022-09-01T00%3A00%3A00.000%2B02%3A00&dateFin=2022-09-07T23%3A59%3A59.999%2B02%3A00`,
        'accessToken'
      )
      const sessionsMilo: EvenementListItem[] = [
        {
          id: 'id-session',
          type: 'info coll i-milo',
          date: '2022-09-01T00:00:00.000+02:00',
          duree: 10080,
          labelBeneficiaires: 'Granger Hermione',
          source: 'MILO',
          isSession: true,
          beneficiaires: [
            { id: 'id-beneficiaire', nom: 'Granger', prenom: 'Hermione' },
          ],
          titre: 'nom session',
        },
        {
          id: 'id-session-2',
          type: 'Atelier i-milo',
          date: '2022-09-01T00:00:00.000+02:00',
          duree: 10080,
          labelBeneficiaires: 'Bénéficiaires multiples',
          source: 'MILO',
          isSession: true,
          beneficiaires: [
            { id: 'id-beneficiaire', nom: 'Granger', prenom: 'Hermione' },
            { id: 'id-beneficiaire-2', nom: 'Potter', prenom: 'Harry' },
          ],
          titre: 'nom session 2',
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
        'id-conseiller-1',
        'session-1',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/milo/id-conseiller-1/sessions/session-1',
        'accessToken'
      )
      const expected = unDetailSession()
      expected.session.dateMaxInscription = '2023-06-17'
      expect(actual).toEqual(expected)
    })

    it("renvoie undefined si la session n'existe pas", async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Session non trouvée')
      )

      // When
      const actual = await getDetailsSession(
        'id-conseiller-1',
        'id-session',
        'accessToken'
      )

      // Then
      expect(actual).toEqual(undefined)
    })
  })

  describe('.configurerSession', () => {
    it('modifie la configuration de la session', async () => {
      // When
      await configurerSession('idSession', {
        estVisible: true,
        autoinscription: false,
      })

      // Then
      expect(apiPatch).toHaveBeenCalledWith(
        '/conseillers/milo/id-conseiller-1/sessions/idSession',
        { autoinscription: false, estVisible: true },
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
        '/conseillers/milo/id-conseiller-1/sessions/idSession',
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
        { idJeune: 'id-beneficiaire-1', statut: 'INSCRIT' },
        { idJeune: 'id-beneficiaire-2', statut: 'REFUS_TIERS' },
      ]

      // When
      await cloreSession('id-conseiller-1', 'id-session', [
        { idJeune: 'id-beneficiaire-1', statut: 'INSCRIT' },
        { idJeune: 'id-beneficiaire-2', statut: 'REFUS_TIERS' },
      ])

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/milo/id-conseiller-1/sessions/id-session/cloturer',
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
      const periode = {
        debut: DateTime.fromISO('2022-09-01T11:00:00.000+02:00'),
        fin: DateTime.fromISO('2022-09-08T11:00:00.000+02:00'),
        label: 'Semaine du 1 au 8 septembre 2022',
      }
      const dateDebutUrlEncoded = encodeURIComponent(periode.debut.toISO())
      const dateFinUrlEncoded = encodeURIComponent(periode.fin.toISO())
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
        {
          id: '2',
          nomSession: 'Une-session-2',
          nomOffre: 'Une-offre-2',
          dateHeureDebut: '2022-09-01T11:00:00.000Z',
          dateHeureFin: '2022-09-01T13:00:00.000Z',
          type: {
            code: 'WORKSHOP',
            label: 'Atelier',
          },
          inscription: 'PRESENT',
        },
        {
          id: '3',
          nomSession: 'Une-session-3',
          nomOffre: 'Une-offre-3',
          dateHeureDebut: '2022-09-01T11:00:00.000Z',
          dateHeureFin: '2022-09-01T13:00:00.000Z',
          type: {
            code: 'WORKSHOP',
            label: 'Atelier',
          },
          inscription: 'REFUS_JEUNE',
        },
      ]
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: sessionsMiloJeuneJson,
      })

      // When
      const actual = await getSessionsMiloBeneficiaire('id-jeune', periode)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/jeunes/milo/${idJeune}/sessions?dateDebut=${dateDebutUrlEncoded}&dateFin=${dateFinUrlEncoded}&filtrerEstInscrit=true`,
        accessToken
      )

      const sessionsMiloJeune: EvenementListItem[] = [
        {
          id: '1',
          type: 'Atelier i-milo',
          date: '2022-09-01T11:00:00.000Z',
          duree: 120,
          isSession: true,
          titre: 'Une-session',
          futPresent: undefined,
        },
        {
          id: '2',
          type: 'Atelier i-milo',
          date: '2022-09-01T11:00:00.000Z',
          duree: 120,
          isSession: true,
          titre: 'Une-session-2',
          futPresent: true,
        },
        {
          id: '3',
          type: 'Atelier i-milo',
          date: '2022-09-01T11:00:00.000Z',
          duree: 120,
          isSession: true,
          titre: 'Une-session-3',
          futPresent: false,
        },
      ]
      expect(actual).toEqual(sessionsMiloJeune)
    })
    it("renvoie un tableau vide si les sessions n'existent pas", async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Sessions non trouvées')
      )
      const periode = {
        debut: DateTime.fromISO('2025-04-07'),
        fin: DateTime.fromISO('2025-04-13'),
        label: 'Semaine du 7 au 13 avril 2025',
      }

      // When
      const actual = await getSessionsMiloBeneficiaire('id-jeune', periode)

      // Then
      expect(actual).toEqual([])
    })
  })
})
