import { FakeApiClient } from '../utils/fakeApiClient'

import { ApiClient } from 'clients/api.client'
import { unConseiller } from 'fixtures/conseiller'
import {
  desConseillersJeune,
  desConseillersJeuneJson,
  desJeunes,
  desJeunesJson,
  unJeune,
  unJeuneJson,
} from 'fixtures/jeune'
import { Jeune } from 'interfaces/jeune'
import { JeunesApiService } from 'services/jeunes.service'
import { RequestError } from 'utils/httpClient'

describe('JeunesApiService', () => {
  let apiClient: ApiClient
  let jeunesService: JeunesApiService
  beforeEach(async () => {
    // Given
    apiClient = new FakeApiClient()
    jeunesService = new JeunesApiService(apiClient)
  })

  describe('.getJeunesDuConseiller', () => {
    it('renvoie les jeunes du conseiller', async () => {
      // Given
      const idConseiller = 'idConseiller'
      const accessToken = 'accessToken'
      const jeunesJson = desJeunesJson()
      ;(apiClient.get as jest.Mock).mockResolvedValue(jeunesJson)

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
      expect(actual).toEqual(desJeunes())
    })
  })

  describe('.getJeunesDuConseillerParEmail', () => {
    const email = 'conseiller@email.com'
    const accessToken = 'accessToken'
    const conseiller = unConseiller()
    const jeunes = desJeunesJson()
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
      expect(actual).toEqual({
        idConseiller: conseiller.id,
        jeunes: desJeunes(),
      })
    })
  })

  describe('.getJeuneDetails', () => {
    it('renvoie les détails du jeune', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue(unJeuneJson())

      // When
      const actual = await jeunesService.getJeuneDetails(
        'id-jeune',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/jeunes/id-jeune',
        'accessToken'
      )
      expect(actual).toEqual(unJeune())
    })

    it("renvoie undefined si le jeune n'existe pas", async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new RequestError('Jeune non trouvé', 'NON_TROUVE')
      )

      // When
      const actual = await jeunesService.getJeuneDetails(
        'id-jeune',
        'accessToken'
      )

      // Then
      expect(actual).toEqual(undefined)
    })
  })

  describe('.getIdJeuneMilo', () => {
    it("renvoie l'id du jeune MiLo", async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({ id: 'id-jeune' })

      // When
      const actual = await jeunesService.getIdJeuneMilo(
        'numero-dossier',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/conseillers/milo/jeunes/numero-dossier',
        'accessToken'
      )
      expect(actual).toEqual('id-jeune')
    })

    it("renvoie undefined si le jeune n'existe pas", async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new RequestError('Numero dossier non trouvé', 'NON_TROUVE')
      )

      // When
      const actual = await jeunesService.getIdJeuneMilo(
        'numero-dossier',
        'accessToken'
      )

      // Then
      expect(actual).toEqual(undefined)
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
  describe('.getConseillersDuJeune', () => {
    it('renvoie les conseillers du jeune', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue(desConseillersJeuneJson())

      // When
      const actual = await jeunesService.getConseillersDuJeune(
        'id-jeune',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/jeunes/id-jeune/conseillers',
        'accessToken'
      )
      expect(actual).toEqual(desConseillersJeune())
    })
  })
})
