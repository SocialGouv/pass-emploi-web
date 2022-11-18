import { DateTime } from 'luxon'

import { ApiClient } from 'clients/api.client'
import { uneListeDActionsJson } from 'fixtures/action'
import { uneListeDEvenementJson } from 'fixtures/evenement'
import { AgendaApiService, AgendaService } from 'services/agenda.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(() => ({
    accessToken: 'accessToken',
  })),
}))

describe('AgendaService', () => {
  describe('.recupererAgenda', () => {
    let apiClient: ApiClient
    let agendaService: AgendaService
    beforeEach(async () => {
      // Given
      apiClient = new FakeApiClient()
      agendaService = new AgendaApiService(apiClient)
    })

    it('renvoie des actions et des items rendez-vous', async () => {
      // Given
      const maintenant = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: {
          actions: uneListeDActionsJson(),
          rendezVous: uneListeDEvenementJson(),
          metadata: {
            dateDeDebut: '2022-09-01T00:00:00.000+02:00',
            dateDeFin: '2022-09-14T00:00:00.000+02:00',
          },
        },
      })

      // When
      const actual = await agendaService.recupererAgenda('jeune-1', maintenant)

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/jeunes/jeune-1/home/agenda?maintenant=2022-09-01T00%3A00%3A00.000%2B02%3A00',
        'accessToken'
      )
      expect(actual).toEqual({
        entrees: [
          {
            id: '1',
            titre: '21/10/2021 à 12h00 - Prise de nouvelles par téléphone',
            type: 'evenement',
          },
          {
            id: '1',
            titre: '21/10/2021 à 12h00 - Prise de nouvelles par téléphone',
            type: 'evenement',
          },
          {
            id: 'id-action-1',
            statut: 'ARealiser',
            titre: 'Identifier ses atouts et ses compétences',
            type: 'action',
          },
          {
            id: 'id-action-2',
            statut: 'Commencee',
            titre: 'Compléter son cv',
            type: 'action',
          },
          {
            id: 'id-action-3',
            statut: 'Terminee',
            titre: 'Chercher une formation',
            type: 'action',
          },
          {
            id: 'id-action-4',
            statut: 'Terminee',
            titre: "Consulter les offres d'emploi",
            type: 'action',
          },
        ],
        metadata: {
          dateDeDebut: DateTime.fromISO('2022-09-01T00:00:00.000+02:00'),
          dateDeFin: DateTime.fromISO('2022-09-14T00:00:00.000+02:00'),
        },
      })
    })
  })
})
