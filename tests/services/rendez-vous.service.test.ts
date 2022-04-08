import { ApiClient } from 'clients/api.client'
import {
  RendezVousApiService,
  RendezVousService,
} from 'services/rendez-vous.service'
import {
  typesDeRendezVous,
  unRendezVous,
  unRendezVousJson,
} from 'fixtures/rendez-vous'
import { RequestError } from '../../utils/fetchJson'
import { modalites } from '../../referentiel/rdv'
import { RdvFormData } from '../../interfaces/json/rdv'

jest.mock('clients/api.client')

describe('RendezVousApiService', () => {
  let apiClient: ApiClient
  let rendezVousService: RendezVousService
  beforeEach(async () => {
    // Given
    apiClient = new ApiClient()
    rendezVousService = new RendezVousApiService(apiClient)
  })

  describe('.getTypesRendezVous', () => {
    it('renvoie les types de rendez-vous ', async () => {
      // Given
      const accessToken = 'accessToken'
      const typesRendezVous = typesDeRendezVous()
      ;(apiClient.get as jest.Mock).mockResolvedValue(typesRendezVous)

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
      ;(apiClient.get as jest.Mock).mockResolvedValue(unRendezVousJson())

      // When
      const actual = await rendezVousService.getDetailRendezVous(
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

    it("renvoie undefined si le rdv n'existe pas", async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new RequestError('Rdv non trouvé', 'NON_TROUVE')
      )

      // When
      const actual = await rendezVousService.getDetailRendezVous(
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
        jeuneId: 'jeune-1',
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
      await rendezVousService.updateRendezVous(
        'id-rdv',
        rdvFormData,
        'accessToken'
      )

      // Then
      expect(apiClient.put).toHaveBeenCalledWith(
        '/rendezvous/id-rdv',
        {
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
})
