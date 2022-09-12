import { ApiClient } from 'clients/api.client'
import {
  typesDeRendezVous,
  unRendezVous,
  unRendezVousJson,
} from 'fixtures/rendez-vous'
import { RdvFormData } from 'interfaces/json/rdv'
import { modalites } from 'referentiel/rdv'
import {
  RendezVousApiService,
  RendezVousService,
} from 'services/rendez-vous.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'
import { ApiError } from 'utils/httpClient'
import { DateTime } from 'luxon'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(async () => ({
    user: { id: 'id-conseiller' },
    accessToken: 'accessToken',
  })),
}))

describe('RendezVousApiService', () => {
  let apiClient: ApiClient
  let rendezVousService: RendezVousService
  beforeEach(async () => {
    // Given
    apiClient = new FakeApiClient()
    rendezVousService = new RendezVousApiService(apiClient)
  })

  describe('.getTypesRendezVous', () => {
    it('renvoie les types de rendez-vous ', async () => {
      // Given
      const accessToken = 'accessToken'
      const typesRendezVous = typesDeRendezVous()
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: typesRendezVous,
      })

      // When
      const actual = await rendezVousService.getTypesRendezVous(accessToken)

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/referentiels/types-rendezvous',
        accessToken
      )
      expect(actual).toEqual(typesRendezVous)
    })
  })

  describe('.getDetailRendezVous', () => {
    it('renvoie les détails du rdv', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: unRendezVousJson(),
      })

      // When
      const actual = await rendezVousService.getDetailsRendezVous(
        'id-rdv',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/rendezvous/id-rdv',
        'accessToken'
      )
      expect(actual).toEqual(unRendezVous())
    })

    it("renvoie les détails d'un rdv sans créateur", async () => {
      // Given
      const rdvJson = unRendezVousJson()
      delete rdvJson.createur
      ;(apiClient.get as jest.Mock).mockResolvedValue({ content: rdvJson })

      // When
      const actual = await rendezVousService.getDetailsRendezVous(
        'id-rdv',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/rendezvous/id-rdv',
        'accessToken'
      )
      expect(actual).toEqual(unRendezVous({ createur: null }))
    })

    it("renvoie undefined si le rdv n'existe pas", async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Rdv non trouvé')
      )

      // When
      const actual = await rendezVousService.getDetailsRendezVous(
        'id-rdv',
        'accessToken'
      )

      // Then
      expect(actual).toEqual(undefined)
    })
  })

  describe('updateRendezVous', () => {
    it('met à jour un rendez vous déja existant', async () => {
      // Given
      const rdvFormData: RdvFormData = {
        jeunesIds: ['jeune-1', 'jeune-2'],
        type: 'AUTRE',
        precision: 'un texte de précision',
        modality: modalites[0],
        date: '2022-03-03T09:30:00.000Z',
        duration: 157,
        adresse: undefined,
        organisme: undefined,
        presenceConseiller: true,
        invitation: false,
        comment: 'Lorem ipsum dolor sit amet',
      }

      // When
      await rendezVousService.updateRendezVous('id-rdv', rdvFormData)

      // Then
      expect(apiClient.put).toHaveBeenCalledWith(
        '/rendezvous/id-rdv',
        {
          jeunesIds: ['jeune-1', 'jeune-2'],
          modality: modalites[0],
          date: '2022-03-03T09:30:00.000Z',
          duration: 157,
          adresse: undefined,
          organisme: undefined,
          presenceConseiller: true,
          comment: 'Lorem ipsum dolor sit amet',
        },
        'accessToken'
      )
    })
  })
  describe('.getRendezVousConseiller', () => {
    it('url encode les date en paramètres et renvoie les rendez-vous d’un conseiller sur une période définie', async () => {
      // Given
      const accessToken = 'accessToken'
      const listeRdvs = [unRendezVousJson()]
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: listeRdvs,
      })
      const dateDebut = DateTime.fromJSDate(new Date(2022, 9, 23))
      const dateFin = DateTime.fromJSDate(new Date(2022, 9, 29))

      // When
      const actual = await rendezVousService.getRendezVousConseillerClientSide(
        accessToken,
        dateDebut,
        dateFin
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/v2/conseillers/accessToken/rendezvous?dateDebut=2022-10-23T00%3A00%3A00.000%2B03%3A00&dateFin=2022-10-29T00%3A00%3A00.000%2B03%3A00`,
        accessToken
      )
      expect(actual).toEqual([unRendezVous()])
    })
  })
})
