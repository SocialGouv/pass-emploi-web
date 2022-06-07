import { ApiClient } from '../../clients/api.client'
import {
  FichiersApiService,
  FichiersService,
} from '../../services/fichiers.services'
import { FakeApiClient } from '../utils/fakeApiClient'

describe('FichierApiService', () => {
  let apiClient: ApiClient
  let fichiersService: FichiersService
  beforeEach(async () => {
    // Given
    apiClient = new FakeApiClient()
    fichiersService = new FichiersApiService(apiClient)
  })

  describe('.postFichier', () => {
    it('envoie un fichier', async () => {
      // Given
      const file: File = new File(['un contenu'], 'imageupload.png', {
        type: 'image/png',
      })
      // When
      await fichiersService.postFichier(['id-jeune'], file, 'accessToken')

      // THEN
      expect(apiClient.postFile).toHaveBeenCalledWith(
        '/fichiers',
        expect.objectContaining({}),
        'accessToken'
      )
    })
  })
})
