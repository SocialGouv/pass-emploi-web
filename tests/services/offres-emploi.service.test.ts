import { apiGet } from 'clients/api.client'
import {
  listeAlternancesJson,
  listeBaseAlternances,
  listeBaseOffresEmploi,
  listeOffresEmploiJson,
  unDetailOffreEmploi,
  unDetailOffreJson,
} from 'fixtures/offre'
import { unDepartement, uneCommune } from 'fixtures/referentiel'
import { TypeOffre } from 'interfaces/offre'
import {
  getOffreEmploiClientSide,
  getOffreEmploiServerSide,
  searchAlternances,
  searchOffresEmploi,
} from 'services/offres-emploi.service'
import { ApiError } from 'utils/httpClient'

jest.mock('clients/api.client')

describe('OffresEmploiApiService', () => {
  describe('.getOffreEmploiServerSide', () => {
    it('renvoie l’offre d’emploi si elle est trouvée en base', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unDetailOffreJson(),
      })

      // When
      const actual = await getOffreEmploiServerSide(
        'ID_OFFRE_EMPLOI',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi/ID_OFFRE_EMPLOI',
        'accessToken'
      )
      expect(actual).toStrictEqual(unDetailOffreEmploi())
    })

    it('renvoie l’alternance si elle est trouvée en base', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unDetailOffreJson({ alternance: true }),
      })

      // When
      const actual = await getOffreEmploiServerSide(
        'ID_OFFRE_EMPLOI',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi/ID_OFFRE_EMPLOI',
        'accessToken'
      )
      expect(actual).toStrictEqual(
        unDetailOffreEmploi({ type: TypeOffre.ALTERNANCE })
      )
    })

    it('renvoie undefined si l’offre d’emploi n’est pas trouvée en base', async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'offre d’emploi non trouvée')
      )

      // When
      const actual = await getOffreEmploiServerSide(
        'ID_OFFRE_EMPLOI',
        'accessToken'
      )

      // Then
      expect(actual).toStrictEqual(undefined)
    })
  })

  describe('.getOffreEmploiClientSide', () => {
    it('renvoie l’offre d’emploi si elle est trouvée en base', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unDetailOffreJson(),
      })

      // When
      const actual = await getOffreEmploiClientSide('ID_OFFRE_EMPLOI')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi/ID_OFFRE_EMPLOI',
        'accessToken'
      )
      expect(actual).toStrictEqual(unDetailOffreEmploi())
    })

    it('renvoie l’alternance si elle est trouvée en base', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unDetailOffreJson({ alternance: true }),
      })

      // When
      const actual = await getOffreEmploiClientSide('ID_OFFRE_EMPLOI')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi/ID_OFFRE_EMPLOI',
        'accessToken'
      )
      expect(actual).toStrictEqual(
        unDetailOffreEmploi({ type: TypeOffre.ALTERNANCE })
      )
    })

    it('renvoie undefined si l’offre d’emploi n’est pas trouvée en base', async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'offre d’emploi non trouvée')
      )

      // When
      const actual = await getOffreEmploiClientSide('ID_OFFRE_EMPLOI')

      // Then
      expect(actual).toStrictEqual(undefined)
    })
  })

  describe('.searchOffresEmploi', () => {
    beforeEach(() => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          pagination: { total: 35 },
          results: listeOffresEmploiJson(),
        },
      })
    })

    it('renvoie une liste paginée d’offres d’emploi', async () => {
      // When
      const actual = await searchOffresEmploi({}, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10',
        'accessToken'
      )
      expect(actual).toEqual({
        metadonnees: { nombreTotal: 35, nombrePages: 4 },
        offres: listeBaseOffresEmploi(),
      })
    })

    it('parse les mots clés', async () => {
      // Given
      const query = 'prof industrie'

      // When
      await searchOffresEmploi({ motsCles: query }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&q=prof%20industrie',
        'accessToken'
      )
    })

    it('parse le département', async () => {
      // When
      await searchOffresEmploi(
        { departement: unDepartement({ code: '75' }) },
        3
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&departement=75',
        'accessToken'
      )
    })

    it('parse la commune', async () => {
      // When
      await searchOffresEmploi({ commune: uneCommune({ code: '35238' }) }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&commune=35238',
        'accessToken'
      )
    })

    it('parse les types de contrat', async () => {
      // When
      await searchOffresEmploi({ typesContrats: ['CDI', 'autre'] }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&contrat=CDI&contrat=autre',
        'accessToken'
      )
    })

    it('parse les durées', async () => {
      // When
      await searchOffresEmploi({ durees: ['Temps plein', 'Temps partiel'] }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&duree=1&duree=2',
        'accessToken'
      )
    })

    it('parse la distance', async () => {
      // When
      await searchOffresEmploi({ rayon: 32 }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&rayon=32',
        'accessToken'
      )
    })

    it("parse l'experience", async () => {
      // When
      await searchOffresEmploi({ debutantAccepte: true }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&debutantAccepte=true',
        'accessToken'
      )
    })
  })

  describe('.searchAlternances', () => {
    beforeEach(() => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          pagination: { total: 35 },
          results: listeAlternancesJson(),
        },
      })
    })

    it('renvoie une liste paginée d’alternances', async () => {
      // When
      const actual = await searchAlternances({}, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true',
        'accessToken'
      )
      expect(actual).toEqual({
        metadonnees: { nombreTotal: 35, nombrePages: 4 },
        offres: listeBaseAlternances(),
      })
    })

    it('parse les mots clés', async () => {
      // Given
      const query = 'prof industrie'

      // When
      await searchAlternances({ motsCles: query }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&q=prof%20industrie',
        'accessToken'
      )
    })

    it('parse le département', async () => {
      // When
      await searchAlternances({ departement: unDepartement({ code: '75' }) }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&departement=75',
        'accessToken'
      )
    })

    it('parse la commune', async () => {
      // When
      await searchAlternances({ commune: uneCommune({ code: '35238' }) }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&commune=35238',
        'accessToken'
      )
    })

    it('parse les types de contrat', async () => {
      // When
      await searchAlternances({ typesContrats: ['CDI', 'autre'] }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&contrat=CDI&contrat=autre',
        'accessToken'
      )
    })

    it('parse les durées', async () => {
      // When
      await searchAlternances({ durees: ['Temps plein', 'Temps partiel'] }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&duree=1&duree=2',
        'accessToken'
      )
    })

    it('parse la distance', async () => {
      // When
      await searchAlternances({ rayon: 32 }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&rayon=32',
        'accessToken'
      )
    })

    it("parse l'experience", async () => {
      // When
      await searchAlternances({ debutantAccepte: true }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&debutantAccepte=true',
        'accessToken'
      )
    })
  })
})
