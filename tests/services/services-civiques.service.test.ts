import { ApiClient } from 'clients/api.client'
import {
  listeBaseOffresEmploi,
  listeBaseServicesCiviques,
  listeOffresEmploiJson,
  listeServicesCiviquesJson,
} from 'fixtures/offre'
import {
  ServicesCiviquesApiService,
  ServicesCiviquesService,
} from 'services/services-civiques.service'
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
  let servicesCiviquesService: ServicesCiviquesApiService

  describe('.getLienServiceCivique', () => {
    it('renvoie l’url du service civique si il est trouvée en base', async () => {
      // Given
      apiClient = new FakeApiClient()
      servicesCiviquesService = new ServicesCiviquesApiService(apiClient)
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/services-civique/ID_SERVICE_CIVIQUE`)
          return {
            content: {
              lienAnnonce: 'https://www.services-civique.fr/id-offre',
            },
          }
      })

      // When
      const actual = await servicesCiviquesService.getLienServiceCivique(
        'ID_SERVICE_CIVIQUE'
      )

      // Then
      expect(actual).toStrictEqual('https://www.services-civique.fr/id-offre')
    })

    it('renvoie undefined si le service civique n’est pas trouvée en base', async () => {
      // Given
      apiClient = new FakeApiClient()
      servicesCiviquesService = new ServicesCiviquesApiService(apiClient)
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new ApiError(404, 'service civique non trouvé')
      )

      // When
      const actual = await servicesCiviquesService.getLienServiceCivique(
        'ID_SERVICE_CIVIQUE'
      )

      // Then
      expect(actual).toStrictEqual(undefined)
    })
  })

  describe('.searchServicesCiviques', () => {
    beforeEach(() => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: {
          results: listeServicesCiviquesJson(),
        },
      })
    })

    it('renvoie une liste d’offres d’emploi', async () => {
      // When
      const actual = await servicesCiviquesService.searchServicesCiviques()

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/services-civique',
        'accessToken'
      )
      expect(actual).toEqual(listeBaseServicesCiviques())
    })

    it('parse les coordonnées', async () => {
      // When
      await servicesCiviquesService.searchServicesCiviques({
        coordonnees: { lon: 2.323026, lat: 48.830108 },
      })

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/services-civique?lon=2.323026&lat=48.830108',
        'accessToken'
      )
    })
  })
})
