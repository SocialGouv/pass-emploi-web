import { ApiClient } from 'clients/api.client'
import { uneListeDeDiffusion } from 'fixtures/listes-de-diffusion'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import {
  ListesDeDiffusionApiService,
  ListesDeDiffusionService,
} from 'services/listes-de-diffusion.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(async () => ({
    user: { id: 'idConseiller' },
    accessToken: 'accessToken',
  })),
}))

describe('ListesDeDiffusionApiService', () => {
  let apiClient: ApiClient
  let listesDeDiffusionService: ListesDeDiffusionService
  beforeEach(async () => {
    // Given
    apiClient = new FakeApiClient()
    listesDeDiffusionService = new ListesDeDiffusionApiService(apiClient)
  })

  describe('.getListesDeDiffusion', () => {
    it('renvoie les listes de diffusion du conseiller', async () => {
      // Given
      const listesDeDiffusion: ListeDeDiffusion[] = [
        uneListeDeDiffusion({ id: '1' }),
        uneListeDeDiffusion({ id: '2' }),
      ]
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: listesDeDiffusion,
      })

      // When
      const actual = await listesDeDiffusionService.getListesDeDiffusion(
        'idConseiller',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/conseillers/idConseiller/listes-de-diffusion',
        'accessToken'
      )
      expect(actual).toEqual(listesDeDiffusion)
    })
  })

  describe('.recupererListeDeDiffusion', () => {
    it('renvoie la liste de diffusion', async () => {
      // Given
      const listeDeDiffusion: ListeDeDiffusion = uneListeDeDiffusion()

      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: listeDeDiffusion,
      })

      // When
      const actual = await listesDeDiffusionService.recupererListeDeDiffusion(
        '1',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/listes-de-diffusion/1',
        'accessToken'
      )
      expect(actual).toEqual(listeDeDiffusion)
    })
  })

  describe('.creerListeDeDiffusion', () => {
    it('crée la liste de diffusion', async () => {
      // Given
      const titre = 'Un titre'
      const idsBeneficiaires = ['id-1', 'id-2']

      // When
      await listesDeDiffusionService.creerListeDeDiffusion({
        titre,
        idsBeneficiaires: idsBeneficiaires,
      })

      // Then
      expect(apiClient.post).toHaveBeenCalledWith(
        '/conseillers/idConseiller/listes-de-diffusion',
        { titre, idsBeneficiaires },
        'accessToken'
      )
    })
  })

  describe('.modifierListeDeDiffusion', () => {
    it('modifie la liste de diffusion', async () => {
      // Given
      const titre = 'Un titre'
      const idsBeneficiaires = ['id-1', 'id-2']

      // When
      await listesDeDiffusionService.modifierListeDeDiffusion('id-liste', {
        titre,
        idsBeneficiaires: idsBeneficiaires,
      })

      // Then
      expect(apiClient.put).toHaveBeenCalledWith(
        '/listes-de-diffusion/id-liste',
        { titre, idsBeneficiaires },
        'accessToken'
      )
    })
  })
})
