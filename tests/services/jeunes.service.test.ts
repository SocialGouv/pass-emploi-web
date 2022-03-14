import { ApiClient } from 'clients/api.client'
import { desJeunes } from 'fixtures/jeune'
import { Jeune } from 'interfaces/jeune'
import { JeunesApiService } from 'services/jeunes.service'
import { unConseiller } from '../../fixtures/conseiller'

jest.mock('clients/api.client')

describe('JeunesApiService', () => {
  let apiClient: ApiClient
  let jeunesService: JeunesApiService
  beforeEach(async () => {
    // Given
    apiClient = new ApiClient()
    jeunesService = new JeunesApiService(apiClient)
  })

  describe('.getJeunesDuConseiller', () => {
    it('renvoie les jeunes du conseiller', async () => {
      // Given
      const idConseiller = 'idConseiller'
      const accessToken = 'accessToken'
      const jeunes = desJeunes()
      ;(apiClient.get as jest.Mock).mockResolvedValue(jeunes)

      // When
      const actual = await jeunesService.getJeunesDuConseiller(
        idConseiller,
        accessToken
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/conseillers/${idConseiller}/jeunes`,
        accessToken
      )
      expect(actual).toEqual(jeunes)
    })
  })

  describe('.getJeunesDuConseillerParEmail', () => {
    const email = 'conseiller@email.com'
    const accessToken = 'accessToken'
    const conseiller = unConseiller()
    const jeunes = desJeunes()
    let actual: { idConseiller: string; jeunes: Jeune[] }
    beforeEach(async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockImplementation((url) => {
        if (url === `/conseillers?email=${email}`) return conseiller
        if (url === `/conseillers/${conseiller.id}/jeunes`) return jeunes
      })

      // When
      actual = await jeunesService.getJeunesDuConseillerParEmail(
        email,
        accessToken
      )
    })

    it('récupère le conseiller par son email', async () => {
      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/conseillers?email=${email}`,
        accessToken
      )
    })

    it('renvoie les jeunes du conseiller', async () => {
      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/conseillers/${conseiller.id}/jeunes`,
        accessToken
      )
      expect(actual).toEqual({ idConseiller: conseiller.id, jeunes })
    })
  })

  describe('.reaffecter', () => {
    it('reaffecte les jeunes', async () => {
      // Given
      const idConseillerInitial = 'idConseillerInitial'
      const emailConseillerDestination = 'conseiller@email.com'
      const idConseillerDestination = 'idConseillerDestination'
      const idsJeunes = ['id-jeune-1', 'id-jeune-2']
      ;(apiClient.get as jest.Mock).mockImplementation((url) => {
        if (url === `/conseillers?email=${emailConseillerDestination}`)
          return unConseiller({ id: idConseillerDestination })
      })
      const accessToken = 'accessToken'

      // WHEN
      await jeunesService.reaffecter(
        idConseillerInitial,
        emailConseillerDestination,
        idsJeunes,
        accessToken
      )

      // THEN
      expect(apiClient.post).toHaveBeenCalledWith(
        `/jeunes/transferer`,
        {
          idConseillerSource: idConseillerInitial,
          idConseillerCible: idConseillerDestination,
          idsJeune: idsJeunes,
        },
        accessToken
      )
    })
  })

  describe('.supprimerJeune', () => {
    it('supprime le jeune', async () => {
      // Given
      const accessToken = 'accessToken'

      // When
      await jeunesService.supprimerJeune('id-jeune', accessToken)

      // Then
      expect(apiClient.delete).toHaveBeenCalledWith(
        `/jeunes/id-jeune`,
        accessToken
      )
    })
  })
})
