import { ApiClient } from 'clients/api.client'
import { listeBaseImmersions, listeImmersionsJson } from 'fixtures/offre'
import { uneCommune, unMetier } from 'fixtures/referentiel'
import {
  ImmersionsApiService,
  ImmersionsService,
} from 'services/immersions.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(async () => ({
    user: { id: 'idConseiller' },
    accessToken: 'accessToken',
  })),
}))

describe('ImmersionsApiService', () => {
  let apiClient: ApiClient
  let immersionsService: ImmersionsService

  beforeEach(() => {
    apiClient = new FakeApiClient()
    immersionsService = new ImmersionsApiService(apiClient)
  })

  describe('.searchImmersions', () => {
    beforeEach(() => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: listeImmersionsJson(),
      })
    })

    it("renvoie une liste d'immersions", async () => {
      // When
      const actual = await immersionsService.searchImmersions({
        commune: uneCommune(),
        metier: unMetier(),
        rayon: 52,
      })

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-immersion?lat=48.830108&lon=2.323026&distance=52&rome=M1805',
        'accessToken'
      )

      expect(actual).toEqual(listeBaseImmersions())
    })
  })
})
