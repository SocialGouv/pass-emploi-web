import { ApiClient } from 'clients/api.client'
import { unConseiller } from 'fixtures/conseiller'
import {
  desConseillersJeune,
  desConseillersJeuneJson,
  desItemsJeunes,
  desItemsJeunesJson,
  unDetailJeune,
  unDetailJeuneJson,
} from 'fixtures/jeune'
import { JeuneFromListe } from 'interfaces/jeune'
import { JeunesApiService } from 'services/jeunes.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'
import { ApiError } from 'utils/httpClient'

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
      const jeunesJson = desItemsJeunesJson()
      ;(apiClient.get as jest.Mock).mockResolvedValue({ content: jeunesJson })

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
      expect(actual).toEqual(desItemsJeunes())
    })
  })

  describe('.getJeunesDuConseillerParEmail', () => {
    const email = 'conseiller@email.com'
    const accessToken = 'accessToken'
    const conseiller = unConseiller()
    const jeunes = desItemsJeunesJson()
    let actual: { idConseiller: string; jeunes: JeuneFromListe[] }
    beforeEach(async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockImplementation((url) => {
        if (url === `/conseillers?email=${email}`)
          return { content: conseiller }
        if (url === `/conseillers/${conseiller.id}/jeunes`)
          return { content: jeunes }
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
        jeunes: desItemsJeunes(),
      })
    })
  })

  describe('.getJeuneDetails', () => {
    it('renvoie les détails du jeune', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: unDetailJeuneJson({
          urlDossier: 'url-dossier',
        }),
      })

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
      expect(actual).toEqual(
        unDetailJeune({
          urlDossier: 'url-dossier',
        })
      )
    })

    it("renvoie undefined si le jeune n'existe pas", async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Jeune non trouvé')
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
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: { id: 'id-jeune' },
      })

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
        new ApiError(404, 'Numero dossier non trouvé')
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
      const estTemporaire = false
      ;(apiClient.get as jest.Mock).mockImplementation((url) => {
        if (url === `/conseillers?email=${emailConseillerDestination}`)
          return { content: unConseiller({ id: idConseillerDestination }) }
      })
      const accessToken = 'accessToken'

      // WHEN
      await jeunesService.reaffecter(
        idConseillerInitial,
        emailConseillerDestination,
        idsJeunes,
        estTemporaire,
        accessToken
      )

      // THEN
      expect(apiClient.post).toHaveBeenCalledWith(
        `/jeunes/transferer`,
        {
          idConseillerSource: idConseillerInitial,
          idConseillerCible: idConseillerDestination,
          estTemporaire: false,
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
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: desConseillersJeuneJson(),
      })

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
