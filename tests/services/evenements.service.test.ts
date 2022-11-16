import { DateTime } from 'luxon'

import { ApiClient } from 'clients/api.client'
import {
  typesEvenement,
  uneAnimationCollective,
  unEvenementListItem,
  unEvenement,
  unEvenementJeuneJson,
  unEvenementJson,
} from 'fixtures/evenement'
import { AnimationCollective } from 'interfaces/evenement'
import {
  AnimationCollectiveJson,
  EvenementFormData,
} from 'interfaces/json/evenement'
import { modalites } from 'referentiel/rdv'
import {
  EvenementsApiService,
  EvenementsService,
} from 'services/evenements.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'
import { ApiError } from 'utils/httpClient'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(async () => ({
    user: { id: 'id-conseiller' },
    accessToken: 'accessToken',
  })),
}))

describe('EvenementsApiService', () => {
  let apiClient: ApiClient
  let evenementsService: EvenementsService
  beforeEach(async () => {
    // Given
    apiClient = new FakeApiClient()
    evenementsService = new EvenementsApiService(apiClient)
  })

  describe('.getTypesRendezVous', () => {
    it('renvoie les types de rendez-vous ', async () => {
      // Given
      const accessToken = 'accessToken'
      const typesRendezVous = typesEvenement()
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: typesRendezVous,
      })

      // When
      const actual = await evenementsService.getTypesRendezVous(accessToken)

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/referentiels/types-rendezvous',
        accessToken
      )
      expect(actual).toEqual(typesRendezVous)
    })
  })

  describe('.getDetailEvenement', () => {
    it('renvoie les détails de l’événement', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: unEvenementJson(),
      })

      // When
      const actual = await evenementsService.getDetailsEvenement(
        'id-rdv',
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/rendezvous/id-rdv?avecHistorique=true',
        'accessToken'
      )
      expect(actual).toEqual(unEvenement())
    })

    it("renvoie undefined si l’événement n'existe pas", async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Rdv non trouvé')
      )

      // When
      const actual = await evenementsService.getDetailsEvenement(
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
      const rdvFormData: EvenementFormData = {
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
      await evenementsService.updateRendezVous('id-rdv', rdvFormData)

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
        unEvenementJson(),
        unEvenementJson({
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
      const actual = await evenementsService.getRendezVousConseiller(
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
        unEvenementListItem(),
        unEvenementListItem({ beneficiaires: 'Bénéficiaires multiples' }),
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
        content: [unEvenementJeuneJson()],
      })

      // When
      const actual = await evenementsService.getRendezVousJeune(
        'id-jeune',
        'PASSES',
        accessToken
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        `/jeunes/${idJeune}/rendezvous?periode=${periode}`,
        accessToken
      )
      expect(actual).toEqual([unEvenementListItem()])
    })
  })

  describe('.getRendezVousEtablissement', () => {
    it('renvoie les rendez-vous d’un établissement', async () => {
      // Given
      const dateDebut = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
      const dateFin = DateTime.fromISO('2022-09-07T23:59:59.999+02:00')
      const animationsCollectivesJson: AnimationCollectiveJson[] = [
        {
          ...unEvenementJson({
            id: 'ac-passee',
            type: { code: 'whatever', label: 'Information collective' },
            date: dateDebut.toISO(),
          }),
          statut: 'A_VENIR',
        },
        {
          ...unEvenementJson({
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
      const actual = await evenementsService.getRendezVousEtablissement(
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
          date: dateDebut,
          statut: 'A_VENIR',
        }),
        uneAnimationCollective({
          id: 'ac-future',
          type: 'Atelier',
          date: dateFin,
          statut: 'CLOTUREE',
        }),
      ]
      expect(actual).toEqual(animationsCollectives)
    })
  })
})
