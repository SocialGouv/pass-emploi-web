import { apiGet } from 'clients/api.client'
import {
  listeBaseImmersions,
  listeImmersionsJson,
  unDetailImmersion,
  unDetailImmersionJson,
} from 'fixtures/offre'
import { uneCommune, unMetier } from 'fixtures/referentiel'
import {
  getImmersionServerSide,
  searchImmersions,
} from 'services/immersions.service'
import { ApiError } from 'utils/httpClient'

jest.mock('clients/api.client')

describe('ImmersionsApiService', () => {
  describe('.getImmersionServerSide', () => {
    it("renvoie l'immersion si elle est trouvée en base", async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unDetailImmersionJson(),
      })

      // When
      const actual = await getImmersionServerSide('ID_IMMERSION', 'accessToken')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-immersion/ID_IMMERSION',
        'accessToken'
      )
      expect(actual).toStrictEqual(unDetailImmersion())
    })

    it('renvoie undefined si l’immersion n’est pas trouvée en base', async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'immersion non trouvée')
      )

      // When
      const actual = await getImmersionServerSide('ID_IMMERSION', 'accessToken')

      // Then
      expect(actual).toStrictEqual(undefined)
    })
  })

  describe('.searchImmersions', () => {
    beforeEach(() => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [
          ...listeImmersionsJson({ page: 1 }),
          ...listeImmersionsJson({ page: 2 }),
          ...listeImmersionsJson({ page: 3 }),
        ],
      })
    })

    it('renvoie une liste des 10 premieres immersions', async () => {
      // When
      const actual = await searchImmersions(
        {
          commune: { value: uneCommune() },
          metier: { value: unMetier() },
          rayon: 52,
        },
        1
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
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
      await searchImmersions(
        {
          commune: { value: uneCommune() },
          metier: { value: unMetier() },
          rayon: 35,
        },
        1
      )

      // When
      const actual = await searchImmersions(
        {
          commune: { value: uneCommune() },
          metier: { value: unMetier() },
          rayon: 35,
        },
        1
      )

      // Then
      expect(apiGet).toHaveBeenCalledTimes(1)
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
      await searchImmersions(
        {
          commune: { value: uneCommune() },
          metier: { value: unMetier() },
          rayon: 52,
        },
        1
      )

      // When
      const actual = await searchImmersions(
        {
          commune: { value: uneCommune() },
          metier: { value: unMetier() },
          rayon: 27,
        },
        1
      )

      // Then
      expect(apiGet).toHaveBeenCalledTimes(2)
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
      const actual = await searchImmersions(
        {
          commune: { value: uneCommune() },
          metier: { value: unMetier() },
          rayon: 52,
        },
        2
      )

      // Then
      expect(apiGet).toHaveBeenCalledTimes(1)
      expect(actual).toEqual({
        offres: [...listeBaseImmersions({ page: 3 })],
        metadonnees: { nombreTotal: 15, nombrePages: 2 },
      })
    })
  })
})
