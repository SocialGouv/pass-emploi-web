import { ApiClient } from 'clients/api.client'
import {
  listeBaseOffres,
  listeOffresJson,
  unDetailOffre,
  unDetailOffreJson,
} from 'fixtures/offre'
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

  beforeEach(() => {
    apiClient = new FakeApiClient()
    offresEmploiService = new OffresEmploiApiService(apiClient)
  })

  describe('.getLienOffreEmploi', () => {
    it('renvoie le lien de l’offre d’emploi si elle est trouvée en base', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: unDetailOffreJson(),
      })

      // When
      const actual = await offresEmploiService.getLienOffreEmploi(
        'ID_OFFRE_EMPLOI'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-emploi/ID_OFFRE_EMPLOI',
        'accessToken'
      )
      expect(actual).toStrictEqual(
        unDetailOffreJson().urlRedirectPourPostulation
      )
    })

    it('renvoie undefined si l’offre d’emploi n’est pas trouvée en base', async () => {
      // Given
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

  describe('.getOffreEmploiServerSide', () => {
    it('renvoie l’offre d’emploi si elle est trouvée en base', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: unDetailOffreJson(),
      })

      // When
      const actual = await offresEmploiService.getOffreEmploiServerSide(
        'ID_OFFRE_EMPLOI',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-emploi/ID_OFFRE_EMPLOI',
        'accessToken'
      )
      expect(actual).toStrictEqual(unDetailOffre())
    })

    it('renvoie undefined si l’offre d’emploi n’est pas trouvée en base', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new ApiError(404, 'offre d’emploi non trouvée')
      )

      // When
      const actual = await offresEmploiService.getOffreEmploiServerSide(
        'ID_OFFRE_EMPLOI',
        'accessToken'
      )

      // Then
      expect(actual).toStrictEqual(undefined)
    })
  })

  describe('.searchOffresEmploi', () => {
    beforeEach(() => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: {
          results: listeOffresJson(),
        },
      })
    })

    it('renvoie une liste d’offres d’emploi', async () => {
      // When
      const actual = await offresEmploiService.searchOffresEmploi()

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-emploi?alternance=false',
        'accessToken'
      )
      expect(actual).toEqual(listeBaseOffres())
    })

    it('parse les mots clés', async () => {
      // Given
      const query = 'prof industrie'

      // When
      await offresEmploiService.searchOffresEmploi({
        motsCles: query,
      })

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-emploi?alternance=false&q=prof%20industrie',
        'accessToken'
      )
    })

    it('parse le département', async () => {
      // When
      await offresEmploiService.searchOffresEmploi({
        departement: '75',
      })

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-emploi?alternance=false&departement=75',
        'accessToken'
      )
    })

    it('parse la commune', async () => {
      // When
      await offresEmploiService.searchOffresEmploi({
        commune: '35238',
      })

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-emploi?alternance=false&commune=35238',
        'accessToken'
      )
    })

    it('parse les types de contrat', async () => {
      // When
      await offresEmploiService.searchOffresEmploi({
        typesContrats: ['CDI', 'autre'],
      })

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-emploi?alternance=false&contrat=CDI&contrat=autre',
        'accessToken'
      )
    })

    it('parse les durées', async () => {
      // When
      await offresEmploiService.searchOffresEmploi({
        durees: ['Temps plein', 'Temps partiel'],
      })

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-emploi?alternance=false&duree=1&duree=2',
        'accessToken'
      )
    })

    it('parse la distance', async () => {
      // When
      await offresEmploiService.searchOffresEmploi({
        rayon: 32,
      })

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-emploi?alternance=false&rayon=32',
        'accessToken'
      )
    })

    it("parse l'experience", async () => {
      // When
      await offresEmploiService.searchOffresEmploi({
        debutantAccepte: true,
      })

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/offres-emploi?alternance=false&debutantAccepte=true',
        'accessToken'
      )
    })
  })
})
