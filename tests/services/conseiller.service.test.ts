import { ApiClient } from 'clients/api.client'
import { unConseiller } from 'fixtures/conseiller'
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
      const conseiller = unConseiller()
      ;(apiClient.get as jest.Mock).mockResolvedValue(conseiller)

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
      expect(actual).toEqual(conseiller)
    })
  })

  describe('.modifierAgence', () => {
    it("modifie le conseiller avec l'id de l'agence", async () => {
      // When
      await conseillerService.modifierAgence(
        'id-conseiller',
        'id-agence',
        'accessToken'
      )

      // Then
      expect(apiClient.put).toHaveBeenCalledWith(
        '/conseillers/id-conseiller',
        { agence: { id: 'id-agence' } },
        'accessToken'
      )
    })
  })
})
