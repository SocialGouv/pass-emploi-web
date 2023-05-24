import { apiGet } from 'clients/api.client'
import {
  uneListeDeRecherches,
  uneListeDeRecherchesJson,
  uneListeDOffres,
  uneListeDOffresJson,
} from 'fixtures/favoris'
import { getOffres, getRecherchesSauvegardees } from 'services/favoris.service'

jest.mock('clients/api.client')

describe('FavorisApiService', () => {
  describe('.getOffres', () => {
    it('renvoie les offres du jeune', async () => {
      // Given
      ;(apiGet as jest.Mock).mockImplementation((url: string) => {
        if (url === `/jeunes/ID_JEUNE/favoris`)
          return { content: uneListeDOffresJson() }
      })

      // When
      const actual = await getOffres('ID_JEUNE', 'accessToken')

      // Then
      expect(actual).toStrictEqual(uneListeDOffres())
    })
  })

  describe('.getRecherches', () => {
    it('renvoie les recherches du jeune', async () => {
      // Given
      ;(apiGet as jest.Mock).mockImplementation((url: string) => {
        if (url === `/jeunes/ID_JEUNE/recherches`)
          return { content: uneListeDeRecherchesJson() }
      })

      // When
      const actual = await getRecherchesSauvegardees('ID_JEUNE', 'accessToken')

      // Then
      expect(actual).toStrictEqual(uneListeDeRecherches())
    })
  })
})
