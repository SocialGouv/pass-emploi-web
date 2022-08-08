import { ApiClient } from 'clients/api.client'
import { OffresEmploiApiService } from 'services/offres-emploi.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'
import { ApiError } from 'utils/httpClient'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(async () => ({
    user: { id: 'idConseiller' },
    accessToken: 'accessToken',
  })),
}))

describe('OffresEmploiApiService', () => {
  let apiClient: ApiClient
  let offresEmploiService: OffresEmploiApiService

  describe('.getLienOffreEmploi', () => {
    it('renvoie l’url de l’offre d’emploi si elle est trouvée en base', async () => {
      // Given
      apiClient = new FakeApiClient()
      offresEmploiService = new OffresEmploiApiService(apiClient)
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/offres-emploi/ID_OFFRE_EMPLOI`)
          return {
            content: {
              urlRedirectPourPostulation:
                'https://www.offres-emploi.fr/id-offre',
            },
          }
      })

      // When
      const actual = await offresEmploiService.getLienOffreEmploi(
        'ID_OFFRE_EMPLOI'
      )

      // Then
      expect(actual).toStrictEqual('https://www.offres-emploi.fr/id-offre')
    })
    it('renvoie undefined si l’offre d’emploi n’est pas trouvée en base', async () => {
      // Given
      apiClient = new FakeApiClient()
      offresEmploiService = new OffresEmploiApiService(apiClient)
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new ApiError(404, 'offre d’emploi non trouvée')
      )

      // When
      const actual = await offresEmploiService.getLienOffreEmploi(
        'ID_OFFRE_EMPLOI'
      )

      // Then
      expect(actual).toStrictEqual(undefined)
    })
  })
})
