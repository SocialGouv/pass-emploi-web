import { FakeApiClient } from '../utils/fakeApiClient'

import { ApiClient } from 'clients/api.client'
import { FichiersApiService, FichiersService } from 'services/fichiers.service'

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
      await fichiersService.uploadFichier(['id-jeune'], file, 'accessToken')

      // THEN
      expect(apiClient.postFile).toHaveBeenCalledWith(
        '/fichiers',
        expect.objectContaining({}),
        'accessToken'
      )
    })
  })
  describe('.deleteFichier', () => {
    it("supprime l'action", async () => {
      // WHEN
      await fichiersService.deleteFichier('id-fichier', 'accessToken')

      // THEN
      expect(apiClient.delete).toHaveBeenCalledWith(
        '/fichiers/id-fichier',
        'accessToken'
      )
    })
  })
})
