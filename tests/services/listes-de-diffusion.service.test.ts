import { ApiClient } from 'clients/api.client'
import { uneListeDeDiffusion } from 'fixtures/listes-de-diffusion'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { ListesDeDiffusionApiService } from 'services/listes-de-diffusion.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(async () => ({
    user: { id: 'idConseiller' },
    accessToken: 'accessToken',
  })),
}))

describe('ListesDeDiffusionApiService', () => {
  let apiClient: ApiClient
  let mockedListesDeDiffusionService: ListesDeDiffusionApiService
  beforeEach(async () => {
    // Given
    apiClient = new FakeApiClient()
    mockedListesDeDiffusionService = new ListesDeDiffusionApiService(apiClient)
  })

  describe('.getListesDeDiffusion', () => {
    it('renvoie les listes de diffusion du conseiller', async () => {
      // Given
      const listesDeDiffusion: ListeDeDiffusion[] = [
        uneListeDeDiffusion({ id: '1' }),
        uneListeDeDiffusion({ id: '2' }),
      ]
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: listesDeDiffusion,
      })

      // When
      const actual = await mockedListesDeDiffusionService.getListesDeDiffusion(
        'idConseiller',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/conseillers/idConseiller/listes-de-diffusion`,
        'accessToken'
      )
      expect(actual).toEqual(listesDeDiffusion)
    })
  })
})
