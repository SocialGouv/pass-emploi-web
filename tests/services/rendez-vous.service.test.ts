import { DateTime } from 'luxon'
import { dtsDtsxOrDtsDtsxMapRegex } from 'ts-loader/dist/constants'

import { ApiClient } from 'clients/api.client'
import {
  typesDeRendezVous,
  uneAnimationCollective,
  unRdvListItem,
  unRendezVous,
  unRendezVousJeuneJson,
  unRendezVousJson,
} from 'fixtures/rendez-vous'
import { AnimationCollectiveJson, RdvFormData } from 'interfaces/json/rdv'
import { AnimationCollective } from 'interfaces/rdv'
import { modalites } from 'referentiel/rdv'
import {
  RendezVousApiService,
  RendezVousService,
} from 'services/rendez-vous.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'
import { ApiError } from 'utils/httpClient'

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

  describe('.updateRendezVous', () => {
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
      const idConseiller = 'idConseiller'
      const listeRdvs = [
        unRendezVousJson(),
        unRendezVousJson({
          jeunes: [
            {
              id: '1',
              prenom: 'Kenji',
              nom: 'Jirac',
            },
            {
              id: '2',
              prenom: 'Nadia',
              nom: 'Sanfamiye',
            },
          ],
        }),
      ]
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: listeRdvs,
      })

      const dateDebut = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
      const dateFin = DateTime.fromISO('2022-09-07T23:59:59.999+02:00')

      // When
      const actual = await rendezVousService.getRendezVousConseiller(
        idConseiller,
        dateDebut,
        dateFin
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/v2/conseillers/idConseiller/rendezvous?dateDebut=2022-09-01T00%3A00%3A00.000%2B02%3A00&dateFin=2022-09-07T23%3A59%3A59.999%2B02%3A00`,
        'accessToken'
      )
      expect(actual).toEqual([
        unRdvListItem(),
        unRdvListItem({ beneficiaires: 'Bénéficiaires multiples' }),
      ])
    })
  })

  describe('.getRendezVousJeune', () => {
    it('renvoie les rendez-vous passés', async () => {
      // Given
      const accessToken = 'accessToken'
      const idJeune = 'id-jeune'
      const periode = 'PASSES'
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: [unRendezVousJeuneJson()],
      })

      // When
      const actual = await rendezVousService.getRendezVousJeune(
        'id-jeune',
        'PASSES',
        accessToken
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/jeunes/${idJeune}/rendezvous?periode=${periode}`,
        accessToken
      )
      expect(actual).toEqual([unRdvListItem()])
    })
  })

  describe('.getRendezVousEtablissement', () => {
    it('renvoie les rendez-vous d’un établissement', async () => {
      // Given
      const dateDebut = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
      const dateFin = DateTime.fromISO('2022-09-07T23:59:59.999+02:00')
      const animationsCollectivesJson: AnimationCollectiveJson[] = [
        {
          ...unRendezVousJson({
            id: 'ac-passee',
            title: 'Titre de l’AC',
            type: { code: 'whatever', label: 'Information collective' },
            date: dateDebut.toISO(),
          }),
          statut: 'A_VENIR',
        },
        {
          ...unRendezVousJson({
            id: 'ac-future',
            type: { code: 'whatever', label: 'Atelier' },
            date: dateFin.toISO(),
          }),
          statut: 'CLOTUREE',
        },
      ]
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: animationsCollectivesJson,
      })

      // When
      const actual = await rendezVousService.getRendezVousEtablissement(
        'id-etablissement',
        dateDebut,
        dateFin
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/etablissements/id-etablissement/animations-collectives?dateDebut=2022-09-01T00%3A00%3A00.000%2B02%3A00&dateFin=2022-09-07T23%3A59%3A59.999%2B02%3A00`,
        'accessToken'
      )
      const animationsCollectives: AnimationCollective[] = [
        uneAnimationCollective({
          id: 'ac-passee',
          type: 'Information collective',
          titre: 'Titre de l’AC',
          date: dateDebut,
          statut: 'A_VENIR',
        }),
        uneAnimationCollective({
          id: 'ac-future',
          type: 'Atelier',
          titre: 'Atelier par téléphone',
          date: dateFin,
          statut: 'CLOTUREE',
        }),
      ]
      expect(actual).toEqual(animationsCollectives)
    })
  })
})
