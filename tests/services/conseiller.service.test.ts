import { ApiClient } from 'clients/api.client'
import { unConseiller, unConseillerJson } from 'fixtures/conseiller'
import { ConseillerApiService } from 'services/conseiller.service'

jest.mock('clients/api.client')

describe('ConseillerApiService', () => {
  let apiClient: ApiClient
  let conseillerService: ConseillerApiService
  beforeEach(async () => {
    // Given
    apiClient = new ApiClient()
    conseillerService = new ConseillerApiService(apiClient)
  })

  describe('.getConseiller', () => {
    it('renvoie les informations d’un conseiller', async () => {
      // Given
      const idConseiller = 'idConseiller'
      const accessToken = 'accessToken'
      ;(apiClient.get as jest.Mock).mockResolvedValue(unConseillerJson())

      // When
      const actual = await conseillerService.getConseiller(
        idConseiller,
        accessToken
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/conseillers/${idConseiller}`,
        accessToken
      )
      expect(actual).toEqual(unConseiller())
    })
  })

  describe('.modifierAgence', () => {
    it("modifie le conseiller avec l'id de l'agence", async () => {
      // When
      await conseillerService.modifierAgence(
        'id-conseiller',
        { id: 'id-agence' },
        'accessToken'
      )

      // Then
      expect(apiClient.put).toHaveBeenCalledWith(
        '/conseillers/id-conseiller',
        { agence: { id: 'id-agence' } },
        'accessToken'
      )
    })

    it("modifie le conseiller avec le nom de l'agence", async () => {
      // When
      await conseillerService.modifierAgence(
        'id-conseiller',
        { nom: 'Agence libre' },
        'accessToken'
      )

      // Then
      expect(apiClient.put).toHaveBeenCalledWith(
        '/conseillers/id-conseiller',
        { agence: { nom: 'Agence libre' } },
        'accessToken'
      )
    })
  })
})
