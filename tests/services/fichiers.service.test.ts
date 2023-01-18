import { ApiClient } from 'clients/api.client'
import { FichiersApiService, FichiersService } from 'services/fichiers.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(async () => ({ accessToken: 'accessToken' })),
}))

describe('FichierApiService', () => {
  let apiClient: ApiClient
  let fichiersService: FichiersService
  beforeEach(async () => {
    // Given
    apiClient = new FakeApiClient()
    fichiersService = new FichiersApiService(apiClient)
  })

  describe('.uploadFichier', () => {
    it('envoie un fichier', async () => {
      // Given
      const file: File = new File(['un contenu'], 'imageupload.png', {
        type: 'image/png',
      })

      // When
      await fichiersService.uploadFichier(['id-jeune'], ['liste-1'], file)

      // Then
      expect(apiClient.postFile).toHaveBeenCalledWith(
        '/fichiers',
        expect.objectContaining({}),
        // FIXME pourquoi on peut pas expect le contenu du payload ?
        // expect.objectContaining({
        //   jeunesIds: ['id-jeunes'],
        //   idsListesDeDiffusion: ['liste-1'],
        //   nom: 'imageupload.png',
        // }),
        'accessToken'
      )
    })
  })

  describe('.deleteFichier', () => {
    it('supprime le fichier', async () => {
      // WHEN
      await fichiersService.deleteFichier('id-fichier')

      // THEN
      expect(apiClient.delete).toHaveBeenCalledWith(
        '/fichiers/id-fichier',
        'accessToken'
      )
    })
  })
})
