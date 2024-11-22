import { apiGet, apiPost } from 'clients/api.client'
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
  partagerRechercheAlternance,
  partagerRechercheOffreEmploi,
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
        'accessToken',
        'emploi'
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
        'accessToken',
        'emploi'
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
        'accessToken',
        'emploi'
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
        'accessToken',
        'emploi'
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
        'accessToken',
        'emplois'
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
        'accessToken',
        'emplois'
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
        'accessToken',
        'emplois'
      )
    })

    it('parse la commune', async () => {
      // When
      await searchOffresEmploi({ commune: uneCommune({ code: '35238' }) }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&commune=35238',
        'accessToken',
        'emplois'
      )
    })

    it('parse les types de contrat', async () => {
      // When
      await searchOffresEmploi({ typesContrats: ['CDI', 'autre'] }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&contrat=CDI&contrat=autre',
        'accessToken',
        'emplois'
      )
    })

    it('parse les durées', async () => {
      // When
      await searchOffresEmploi({ durees: ['Temps plein', 'Temps partiel'] }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&duree=1&duree=2',
        'accessToken',
        'emplois'
      )
    })

    it('parse la distance', async () => {
      // When
      await searchOffresEmploi({ rayon: 32 }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&rayon=32',
        'accessToken',
        'emplois'
      )
    })

    it("parse l'experience", async () => {
      // When
      await searchOffresEmploi({ debutantAccepte: true }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&debutantAccepte=true',
        'accessToken',
        'emplois'
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
        'accessToken',
        'emplois'
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
        'accessToken',
        'emplois'
      )
    })

    it('parse le département', async () => {
      // When
      await searchAlternances({ departement: unDepartement({ code: '75' }) }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&departement=75',
        'accessToken',
        'emplois'
      )
    })

    it('parse la commune', async () => {
      // When
      await searchAlternances({ commune: uneCommune({ code: '35238' }) }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&commune=35238',
        'accessToken',
        'emplois'
      )
    })

    it('parse les types de contrat', async () => {
      // When
      await searchAlternances({ typesContrats: ['CDI', 'autre'] }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&contrat=CDI&contrat=autre',
        'accessToken',
        'emplois'
      )
    })

    it('parse les durées', async () => {
      // When
      await searchAlternances({ durees: ['Temps plein', 'Temps partiel'] }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&duree=1&duree=2',
        'accessToken',
        'emplois'
      )
    })

    it('parse la distance', async () => {
      // When
      await searchAlternances({ rayon: 32 }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&rayon=32',
        'accessToken',
        'emplois'
      )
    })

    it("parse l'experience", async () => {
      // When
      await searchAlternances({ debutantAccepte: true }, 3)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/offres-emploi?page=3&limit=10&alternance=true&debutantAccepte=true',
        'accessToken',
        'emplois'
      )
    })
  })

  describe('.partagerRechercheOffreEmploi', () => {
    it('envoie les bons paramètres de suggestions d’offre d’emploi', async () => {
      // Given
      const idsJeunes = ['beneficiaire-1', 'beneficiaire-2']
      const titre = 'Prof - Paris'
      const labelLocalite = 'Paris'
      const motsCles = 'Prof'
      const codeDepartement = '75'

      // When
      await partagerRechercheOffreEmploi({
        idsJeunes,
        titre,
        motsCles,
        labelLocalite,
        codeDepartement,
      })

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/recherches/suggestions/offres-emploi',
        {
          idsJeunes: idsJeunes,
          titre: titre,
          q: motsCles,
          localisation: labelLocalite,
          departement: codeDepartement,
          alternance: false,
        },
        'accessToken'
      )
    })
  })

  describe('.partagerRechercheAlternance', () => {
    it('envoie les bons paramètres de suggestions d’alternance', async () => {
      // Given
      const idsJeunes = ['beneficiaire-1', 'beneficiaire-2']
      const titre = 'Prof - Paris'
      const labelLocalite = 'Paris'
      const motsCles = 'Prof'
      const codeDepartement = '75'

      // When
      await partagerRechercheAlternance({
        idsJeunes,
        titre,
        motsCles,
        labelLocalite,
        codeDepartement,
      })

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/recherches/suggestions/offres-emploi',
        {
          idsJeunes: idsJeunes,
          titre: titre,
          q: motsCles,
          localisation: labelLocalite,
          departement: codeDepartement,
          alternance: true,
        },
        'accessToken'
      )
    })
  })
})
