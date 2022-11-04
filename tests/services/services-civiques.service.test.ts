import { DateTime } from 'luxon'

import { ApiClient } from 'clients/api.client'
import {
  listeBaseServicesCiviques,
  listeServicesCiviquesJson,
  unServiceCiviqueJson,
} from 'fixtures/offre'
import { uneCommune } from 'fixtures/referentiel'
import { ServicesCiviquesApiService } from 'services/services-civiques.service'
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

  beforeEach(() => {
    apiClient = new FakeApiClient()
    servicesCiviquesService = new ServicesCiviquesApiService(apiClient)
  })

  describe('.getLienServiceCivique', () => {
    it('renvoie l’url du service civique si il est trouvée en base', async () => {
      // Given
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

  describe('.getServiceCiviqueServerSide', () => {
    it('renvoie le service civique si il est trouvé en base', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: unServiceCiviqueJson(),
      })

      // When
      const actual = await servicesCiviquesService.getServiceCiviqueServerSide(
        'ID_SERVICE_CIVIQUE',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/services-civique/ID_SERVICE_CIVIQUE',
        'accessToken'
      )
      expect(actual).toStrictEqual({
        dateDeDebut: '2022-11-01T00:00:00.000Z',
        domaine: 'education',
        id: 'ID_SERVICE_CIVIQUE',
        organisation: "Ligue de l'enseignement fédération de Paris",
        titre:
          'Participer aux dispositifs éducatifs au sein de la Cité éducative des portes du 20ème',
        type: 'SERVICE_CIVIQUE',
        ville: 'Paris',
      })
    })

    it('renvoie undefined si l’offre d’emploi n’est pas trouvée en base', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new ApiError(404, 'service civique non trouvé')
      )

      // When
      const actual = await servicesCiviquesService.getServiceCiviqueServerSide(
        'ID_SERVICE_CIVIQUE',
        'accessToken'
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
          pagination: { total: 35 },
          results: listeServicesCiviquesJson(),
        },
      })
    })

    it('renvoie une liste paginée d’offres d’emploi', async () => {
      // When
      const actual = await servicesCiviquesService.searchServicesCiviques({}, 3)

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/v2/services-civique?page=3&limit=10',
        'accessToken'
      )
      expect(actual).toEqual({
        metadonnees: {
          nombrePages: 4,
          nombreTotal: 35,
        },
        offres: listeBaseServicesCiviques(),
      })
    })

    it('parse les coordonnées', async () => {
      // When
      await servicesCiviquesService.searchServicesCiviques(
        { commune: uneCommune() },
        3
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/v2/services-civique?page=3&limit=10&lon=2.323026&lat=48.830108',
        'accessToken'
      )
    })

    it('parse le domaine', async () => {
      // When
      await servicesCiviquesService.searchServicesCiviques(
        { domaine: 'code-domaine' },
        3
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/v2/services-civique?page=3&limit=10&domaine=code-domaine',
        'accessToken'
      )
    })

    it('parse la date de début', async () => {
      // When
      await servicesCiviquesService.searchServicesCiviques(
        { dateDebut: DateTime.fromISO('2022-11-01') },
        3
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/v2/services-civique?page=3&limit=10&dateDeDebutMinimum=2022-11-01T00%3A00%3A00.000%2B01%3A00',
        'accessToken'
      )
    })

    it('parse le rayon', async () => {
      // When
      await servicesCiviquesService.searchServicesCiviques({ rayon: 43 }, 3)

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/v2/services-civique?page=3&limit=10&distance=43',
        'accessToken'
      )
    })
  })
})
