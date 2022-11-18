import { DateTime } from 'luxon'

import { ApiClient } from 'clients/api.client'
import { uneListeDActions, uneListeDActionsJson } from 'fixtures/action'
import { uneListeDeRendezVousJson, unRdvListItem } from 'fixtures/rendez-vous'
import { AgendaApiService, AgendaService } from 'services/agenda.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(() => ({
    accessToken: 'accessToken',
  })),
}))

describe('AgendaService', () => {
  describe('.recupererAgendaMilo', () => {
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
          rendezVous: uneListeDeRendezVousJson(),
          metadata: {
            actionsEnRetard: 2,
            dateDeDebut: '2022-09-01T00:00:00.000+02:00',
            dateDeFin: '2022-09-14T00:00:00.000+02:00',
          },
        },
      })

      // When
      const actual = await agendaService.recupererAgendaMilo(
        'jeune-1',
        maintenant
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/jeunes/jeune-1/home/agenda?maintenant=2022-09-01T00%3A00%3A00.000%2B02%3A00',
        'accessToken'
      )
      expect(actual).toEqual({
        actions: uneListeDActions(),
        rendezVous: [
          unRdvListItem(),
          unRdvListItem({ beneficiaires: 'Bénéficiaires multiples' }),
        ],
        metadata: {
          actionsEnRetard: 2,
          dateDeDebut: DateTime.fromISO('2022-09-01T00:00:00.000+02:00'),
          dateDeFin: DateTime.fromISO('2022-09-14T00:00:00.000+02:00'),
        },
      })
    })
  })
})
