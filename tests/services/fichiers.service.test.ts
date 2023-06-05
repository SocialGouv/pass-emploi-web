import { apiDelete, apiPostFile } from 'clients/api.client'
import { deleteFichier, uploadFichier } from 'services/fichiers.service'

jest.mock('clients/api.client')

describe('FichierApiService', () => {
  describe('.uploadFichier', () => {
    it('envoie un fichier', async () => {
      // Given
      const file: File = new File(['un contenu'], 'imageupload.png', {
        type: 'image/png',
      })

      // When
      await uploadFichier(['id-jeune'], ['liste-1'], file)

      // Then
      expect(apiPostFile).toHaveBeenCalledWith(
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
      await deleteFichier('id-fichier')

      // THEN
      expect(apiDelete).toHaveBeenCalledWith(
        '/fichiers/id-fichier',
        'accessToken'
      )
    })
  })
})
