import { ApiClient } from 'clients/api.client'

import { RequestError } from 'utils/fetchJson'

import {
  ConseillerApiService,
  ConseillerService,
} from 'services/conseiller.service'
import { unConseiller } from 'fixtures/conseiller'

jest.mock('clients/api.client')

describe('ConseillerApiService', () => {
  let apiClient: ApiClient
  let conseillerService: ConseillerService

  beforeEach(async () => {
    // Given
    apiClient = new ApiClient()
    conseillerService = new ConseillerApiService(apiClient)
  })

  describe('.getDetailsConseiller', () => {
    it('renvoie les détails d’un conseiller', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue(unConseiller())

      // When
      const actual = await conseillerService.getDetailsConseiller(
        '1',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/conseillers/1',
        'accessToken'
      )
      expect(actual).toEqual(unConseiller())
    })

    it("renvoie undefined si le conseiller n'existe pas", async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new RequestError('Conseiller non trouvé', 'NON_TROUVE')
      )

      // When
      const actual = await conseillerService.getDetailsConseiller(
        '1',
        'accessToken'
      )

      // Then
      expect(actual).toEqual(undefined)
    })
  })
})
