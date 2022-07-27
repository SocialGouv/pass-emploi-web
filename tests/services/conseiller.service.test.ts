import { FakeApiClient } from '../utils/fakeApiClient'

import { ApiClient } from 'clients/api.client'
import { unConseiller, unConseillerJson } from 'fixtures/conseiller'
import { ConseillerApiService } from 'services/conseiller.service'

describe('ConseillerApiService', () => {
  let apiClient: ApiClient
  let conseillerService: ConseillerApiService
  beforeEach(async () => {
    // Given
    apiClient = new FakeApiClient()
    conseillerService = new ConseillerApiService(apiClient)
  })

  describe('.getConseiller', () => {
    it('renvoie les informations d’un conseiller', async () => {
      // Given
      const idConseiller = 'idConseiller'
      const accessToken = 'accessToken'
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: unConseillerJson({
          agence: {
            nom: 'Milo Marseille',
            id: 'ID',
          },
        }),
      })

      // When
      const actual = await conseillerService.getConseillerClientSide()

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/conseillers/${idConseiller}`,
        accessToken
      )
      expect(actual).toEqual(unConseiller({ agence: 'Milo Marseille' }))
    })
  })

  describe('.modifierAgence', () => {
    it("modifie le conseiller avec l'id de l'agence", async () => {
      // When
      await conseillerService.modifierAgence({ id: 'id-agence', nom: 'Agence' })

      // Then
      expect(apiClient.put).toHaveBeenCalledWith(
        '/conseillers/id-conseiller',
        { agence: { id: 'id-agence' } },
        'accessToken'
      )
    })

    it("modifie le conseiller avec le nom de l'agence", async () => {
      // When
      await conseillerService.modifierAgence({ nom: 'Agence libre' })

      // Then
      expect(apiClient.put).toHaveBeenCalledWith(
        '/conseillers/id-conseiller',
        { agence: { nom: 'Agence libre' } },
        'accessToken'
      )
    })
  })

  describe('.modifierNotificationsSonores', () => {
    it("modifie le conseiller avec l'activation des notifications sonores", async () => {
      // When
      await conseillerService.modifierNotificationsSonores('id-conseiller', true)

      // Then
      expect(apiClient.put).toHaveBeenCalledWith(
        '/conseillers/id-conseiller',
        { notificationsSonores: true },
        'accessToken'
      )
    })
  })

  describe('.recupererBeneficiaires', () => {
    it('récupère les bénéficiaires transférés temporairement', async () => {
      // When
      await conseillerService.recupererBeneficiaires()

      // Then
      expect(apiClient.post).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/recuperer-mes-jeunes',
        {},
        'accessToken'
      )
    })
  })
})
