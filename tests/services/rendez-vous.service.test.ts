import { ApiClient } from 'clients/api.client'
import {
  RendezVousApiService,
  RendezVousService,
} from 'services/rendez-vous.service'
import { typesDeRendezVous } from 'fixtures/rendez-vous'

jest.mock('clients/api.client')

describe('RendezVousApiService', () => {
  let apiClient: ApiClient
  let rendezVousService: RendezVousService
  beforeEach(async () => {
    // Given
    apiClient = new ApiClient()
    rendezVousService = new RendezVousApiService(apiClient)
  })

  describe('.getTypesRendezVous', () => {
    it('renvoie les types de rendez-vous ', async () => {
      // Given
      const accessToken = 'accessToken'
      const typesRendezVous = typesDeRendezVous()
      ;(apiClient.get as jest.Mock).mockResolvedValue(typesRendezVous)

      // When
      const actual = await rendezVousService.getTypesRendezVous(accessToken)

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/referentiels/types-rendezvous',
        accessToken
      )
      expect(actual).toEqual(typesRendezVous)
    })
  })
})
