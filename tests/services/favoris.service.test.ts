import { apiGet } from 'clients/api.client'
import {
  uneMetadonneeFavoris,
  uneMetadonneeFavorisJson,
} from 'fixtures/beneficiaire'
import {
  uneListeDeRecherches,
  uneListeDeRecherchesJson,
  uneListeDOffres,
  uneListeDOffresJson,
} from 'fixtures/favoris'
import {
  getMetadonneesFavorisJeune,
  getOffres,
  getRecherchesSauvegardees,
} from 'services/favoris.service'

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

  describe('.getMetadonneesFavorisJeune', () => {
    it('renvoie les métadonnées des recherches sauvegardées d’un bénéficiaire', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: { favoris: uneMetadonneeFavorisJson() },
      })

      // When
      const actual = await getMetadonneesFavorisJeune('id-jeune', 'accessToken')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/jeunes/id-jeune/favoris/metadonnees',
        'accessToken',
        'favoris'
      )
      expect(actual).toEqual(uneMetadonneeFavoris())
    })
  })
})
