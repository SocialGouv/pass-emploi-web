import { ApiClient } from 'clients/api.client'
import {
  ServicesCiviqueApiService,
  ServicesCiviqueService,
} from 'services/services-civique.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'
import { ApiError } from 'utils/httpClient'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(async () => ({
    user: { id: 'idConseiller' },
    accessToken: 'accessToken',
  })),
}))

describe('ServicesCiviqueApiService', () => {
  let apiClient: ApiClient
  let servicesCiviqueService: ServicesCiviqueService

  describe('.getLienServiceCivique', () => {
    it('renvoie l’url du service civique si il est trouver en base', async () => {
      // Given
      apiClient = new FakeApiClient()
      servicesCiviqueService = new ServicesCiviqueApiService(apiClient)
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/services-civique/ID_SERVICE_CIVIQUE`)
          return {
            content: {
              lienAnnonce: 'https://www.services-civique.fr/id-offre',
            },
          }
      })

      // When
      const actual = await servicesCiviqueService.getLienServiceCivique(
        'ID_SERVICE_CIVIQUE'
      )

      // Then
      expect(actual).toStrictEqual('https://www.services-civique.fr/id-offre')
    })

    it('renvoie undfined si le service civique n’est pas trouver en base', async () => {
      // Given
      apiClient = new FakeApiClient()
      servicesCiviqueService = new ServicesCiviqueApiService(apiClient)
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new ApiError(404, 'service civique non trouvée')
      )

      // When
      const actual = await servicesCiviqueService.getLienServiceCivique(
        'ID_SERVICE_CIVIQUE'
      )

      // Then
      expect(actual).toStrictEqual(undefined)
    })
  })
})
