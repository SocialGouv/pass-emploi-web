import { DateTime } from 'luxon'

import { ApiClient } from 'clients/api.client'
import {
  typesEvenement,
  uneAnimationCollective,
  unEvenement,
  unEvenementJeuneJson,
  unEvenementJson,
  unEvenementListItem,
} from 'fixtures/evenement'
import {
  AnimationCollective,
  StatutAnimationCollective,
} from 'interfaces/evenement'
import {
  AnimationCollectiveJson,
  EvenementFormData,
} from 'interfaces/json/evenement'
import { modalites } from 'referentiel/evenement'
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
        '/rendezvous/id-rdv',
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
        titre: 'Titre modifié',
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
          titre: 'Titre modifié',
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
        unEvenementListItem({ labelBeneficiaires: 'Bénéficiaires multiples' }),
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
      const expected = unEvenementListItem()
      delete expected.labelBeneficiaires
      expect(actual).toEqual([expected])
    })

    it('renvoie les rendez-vous avec présence du bénéficiaire', async () => {
      // Given
      const accessToken = 'accessToken'
      const idJeune = 'id-jeune'
      const periode = 'PASSES'
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: [
          unEvenementJeuneJson({
            type: { code: 'ATELIER', label: 'Atelier' },
            futPresent: true,
          }),
        ],
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
      const expected = unEvenementListItem({
        type: 'Atelier',
        futPresent: true,
      })

      delete expected.labelBeneficiaires
      expect(actual[0].futPresent).toBeTruthy()
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
          statut: StatutAnimationCollective.AVenir,
        }),
        uneAnimationCollective({
          id: 'ac-future',
          type: 'Atelier',
          date: dateFin,
          statut: StatutAnimationCollective.Close,
        }),
      ]
      expect(actual).toEqual(animationsCollectives)
    })
  })

  describe('.creerEvenement', () => {
    it('crée un nouvel événement', async () => {
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
      ;(apiClient.post as jest.Mock).mockResolvedValue({
        content: { id: 'id-nouvel-evenement' },
      })

      // When
      const result = await evenementsService.creerEvenement(rdvFormData)

      // Then
      expect(apiClient.post).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/rendezvous',
        {
          jeunesIds: ['jeune-1', 'jeune-2'],
          modality: modalites[0],
          type: 'AUTRE',
          date: '2022-03-03T09:30:00.000Z',
          duration: 157,
          adresse: undefined,
          invitation: false,
          organisme: undefined,
          presenceConseiller: true,
          precision: 'un texte de précision',
          comment: 'Lorem ipsum dolor sit amet',
        },
        'accessToken'
      )
      expect(result).toEqual('id-nouvel-evenement')
    })
  })

  describe('.supprimerEvenement', () => {
    it('supprime un événement', async () => {
      // When
      await evenementsService.supprimerEvenement('idEvenement')

      // Then
      expect(apiClient.delete).toHaveBeenCalledWith(
        '/rendezvous/idEvenement',
        'accessToken'
      )
    })
  })

  describe('.cloreAnimationCollective', () => {
    it('clôt une animation collective', async () => {
      // Given
      const idsJeunes = ['jeune-1', 'jeune-2']

      // When
      await evenementsService.cloreAnimationCollective('id-rdv', idsJeunes)

      // Then
      expect(apiClient.post).toHaveBeenCalledWith(
        '/etablissements/animations-collectives/id-rdv/cloturer',
        {
          idsJeunes: ['jeune-1', 'jeune-2'],
        },
        'accessToken'
      )
    })
  })
})
