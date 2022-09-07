import { ApiClient } from 'clients/api.client'
import {
  uneListeDeRecherches,
  uneListeDeRecherchesJson,
  uneListeDOffres,
  uneListeDOffresJson,
} from 'fixtures/favoris'
import { FavorisApiService } from 'services/favoris.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'

describe('FavorisApiService', () => {
  let apiClient: ApiClient
  let favorisService: FavorisApiService
  beforeEach(async () => {
    // Given
    apiClient = new FakeApiClient()
    favorisService = new FavorisApiService(apiClient)
  })

  describe('.getOffres', () => {
    it('renvoie les offres du jeune', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/jeunes/ID_JEUNE/favoris`)
          return { content: uneListeDOffresJson() }
      })

      // When
      const actual = await favorisService.getOffres('ID_JEUNE', 'accessToken')

      // Then
      expect(actual).toStrictEqual(uneListeDOffres())
    })
  })

  describe('.getRecherches', () => {
    it('renvoie les recherches du jeune', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/jeunes/ID_JEUNE/recherches`)
          return { content: uneListeDeRecherchesJson() }
      })

      // When
      const actual = await favorisService.getRecherchesSauvegardees(
        'ID_JEUNE',
        'accessToken'
      )

      // Then
      expect(actual).toStrictEqual(uneListeDeRecherches())
    })
  })
})
