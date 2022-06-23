import { FakeApiClient } from '../utils/fakeApiClient'

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
import { RequestError } from 'utils/httpClient'

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
        new RequestError('Rdv non trouvé', 'NON_TROUVE')
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
      await rendezVousService.updateRendezVous(
        'id-rdv',
        rdvFormData,
        'accessToken'
      )

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
})
