import { ApiClient } from 'clients/api.client'
import { SuggestionsApiService } from 'services/suggestions.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(async () => ({
    user: { id: 'idConseiller' },
    accessToken: 'accessToken',
  })),
}))

describe('SuggestionsApiService', () => {
  let apiClient: ApiClient
  let suggestionsService: SuggestionsApiService

  beforeEach(() => {
    apiClient = new FakeApiClient()
    suggestionsService = new SuggestionsApiService(apiClient)
  })

  describe('.envoyerSuggestionOffreEmploi', () => {
    it('envoie les bons paramètres de suggestions d’offre d’emploi', async () => {
      // Given
      const idsJeunes = ['jeune-1', 'jeune-2']
      const titre = 'Prof - Paris'
      const labelLocalite = 'Paris'
      const motsCles = 'Prof'
      const codeDepartement = '75'

      // When
      await suggestionsService.envoyerSuggestionOffreEmploi({
        idsJeunes,
        titre,
        motsCles,
        labelLocalite,
        codeDepartement,
      })

      // Then
      expect(apiClient.post).toHaveBeenCalledWith(
        '/conseillers/idConseiller/recherches/suggestions/offres-emploi',
        {
          idsJeunes: idsJeunes,
          titre: titre,
          q: motsCles,
          localisation: labelLocalite,
          departement: codeDepartement,
        },
        'accessToken'
      )
    })
  })
})
