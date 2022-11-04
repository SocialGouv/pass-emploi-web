import { ApiClient } from 'clients/api.client'
import {
  listeBaseImmersions,
  listeImmersionsJson,
  unDetailImmersion,
  unDetailImmersionJson,
} from 'fixtures/offre'
import { uneCommune, unMetier } from 'fixtures/referentiel'
import { TypeOffre } from 'interfaces/offre'
import {
  ImmersionsApiService,
  ImmersionsService,
} from 'services/immersions.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'
import { ApiError } from 'utils/httpClient'

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

  describe('.getImmersionServerSide', () => {
    it("renvoie l'immersion si elle est trouvée en base", async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: unDetailImmersionJson(),
      })

      // When
      const actual = await immersionsService.getImmersionServerSide(
        'ID_IMMERSION',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-immersion/ID_IMMERSION',
        'accessToken'
      )
      expect(actual).toStrictEqual(unDetailImmersion())
    })

    it('renvoie undefined si l’immersion n’est pas trouvée en base', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new ApiError(404, 'immersion non trouvée')
      )

      // When
      const actual = await immersionsService.getImmersionServerSide(
        'ID_IMMERSION',
        'accessToken'
      )

      // Then
      expect(actual).toStrictEqual(undefined)
    })
  })

  describe('.searchImmersions', () => {
    beforeEach(() => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: [
          ...listeImmersionsJson({ page: 1 }),
          ...listeImmersionsJson({ page: 2 }),
          ...listeImmersionsJson({ page: 3 }),
        ],
      })
    })

    it('renvoie une liste des 10 premieres immersions', async () => {
      // When
      const actual = await immersionsService.searchImmersions(
        {
          commune: uneCommune(),
          metier: unMetier(),
          rayon: 52,
        },
        1
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-immersion?lat=48.830108&lon=2.323026&distance=52&rome=M1805',
        'accessToken'
      )

      expect(actual).toEqual({
        offres: [
          ...listeBaseImmersions({ page: 1 }),
          ...listeBaseImmersions({ page: 2 }),
        ],
        metadonnees: { nombreTotal: 15, nombrePages: 2 },
      })
    })

    it('cache les données pour la pagination', async () => {
      // Given
      await immersionsService.searchImmersions(
        {
          commune: uneCommune(),
          metier: unMetier(),
          rayon: 52,
        },
        1
      )

      // When
      const actual = await immersionsService.searchImmersions(
        {
          commune: uneCommune(),
          metier: unMetier(),
          rayon: 52,
        },
        1
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledTimes(1)
      expect(actual).toEqual({
        offres: [
          ...listeBaseImmersions({ page: 1 }),
          ...listeBaseImmersions({ page: 2 }),
        ],
        metadonnees: { nombreTotal: 15, nombrePages: 2 },
      })
    })

    it('met à jour le cache si la requête change', async () => {
      // Given
      await immersionsService.searchImmersions(
        {
          commune: uneCommune(),
          metier: unMetier(),
          rayon: 52,
        },
        1
      )

      // When
      const actual = await immersionsService.searchImmersions(
        {
          commune: uneCommune(),
          metier: unMetier(),
          rayon: 27,
        },
        1
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledTimes(2)
      expect(actual).toEqual({
        offres: [
          ...listeBaseImmersions({ page: 1 }),
          ...listeBaseImmersions({ page: 2 }),
        ],
        metadonnees: { nombreTotal: 15, nombrePages: 2 },
      })
    })

    it('renvoie la page demandée', async () => {
      // When
      const actual = await immersionsService.searchImmersions(
        {
          commune: uneCommune(),
          metier: unMetier(),
          rayon: 52,
        },
        2
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledTimes(1)
      expect(actual).toEqual({
        offres: [...listeBaseImmersions({ page: 3 })],
        metadonnees: { nombreTotal: 15, nombrePages: 2 },
      })
    })
  })
})
