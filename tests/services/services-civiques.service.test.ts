import { apiGet } from 'clients/api.client'
import {
  listeBaseServicesCiviques,
  listeServicesCiviquesJson,
  unServiceCiviqueJson,
} from 'fixtures/offre'
import { uneCommune } from 'fixtures/referentiel'
import {
  getServiceCiviqueServerSide,
  searchServicesCiviques,
} from 'services/services-civiques.service'
import { ApiError } from 'utils/httpClient'

jest.mock('clients/api.client')

describe('ServicesCiviqueApiService', () => {
  describe('.getServiceCiviqueServerSide', () => {
    it('renvoie le service civique si il est trouvé en base', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unServiceCiviqueJson(),
      })

      // When
      const actual = await getServiceCiviqueServerSide(
        'ID_SERVICE_CIVIQUE',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
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
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'service civique non trouvé')
      )

      // When
      const actual = await getServiceCiviqueServerSide(
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
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          pagination: { total: 35 },
          results: listeServicesCiviquesJson(),
        },
      })
    })

    it('renvoie une liste paginée d’offres d’emploi', async () => {
      // When
      const actual = await searchServicesCiviques({}, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
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
      await searchServicesCiviques({ commune: uneCommune() }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/services-civique?page=3&limit=10&lon=2.323026&lat=48.830108',
        'accessToken'
      )
    })

    it('parse le domaine', async () => {
      // When
      await searchServicesCiviques({ domaine: 'code-domaine' }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/services-civique?page=3&limit=10&domaine=code-domaine',
        'accessToken'
      )
    })

    it('parse la date de début', async () => {
      // When
      await searchServicesCiviques({ dateDebut: '2022-11-01' }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/services-civique?page=3&limit=10&dateDeDebutMinimum=2022-11-01T00%3A00%3A00.000%2B01%3A00',
        'accessToken'
      )
    })

    it('parse le rayon', async () => {
      // When
      await searchServicesCiviques({ rayon: 43 }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/services-civique?page=3&limit=10&distance=43',
        'accessToken'
      )
    })
  })
})
