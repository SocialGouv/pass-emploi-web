import { DateTime } from 'luxon'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import {
  typesEvenement,
  uneAnimationCollective,
  uneListeDAnimationCollectiveAClore,
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
  cloreAnimationCollective,
  creerEvenement,
  getAnimationsCollectivesACloreClientSide,
  getAnimationsCollectivesACloreServerSide,
  getDetailsEvenement,
  getRendezVousConseiller,
  getRendezVousEtablissement,
  getRendezVousJeune,
  getTypesRendezVous,
  supprimerEvenement,
  updateRendezVous,
} from 'services/evenements.service'
import { ApiError } from 'utils/httpClient'

jest.mock('clients/api.client')

describe('EvenementsApiService', () => {
  describe('.getTypesRendezVous', () => {
    it('renvoie les types de rendez-vous ', async () => {
      // Given
      const accessToken = 'accessToken'
      const typesRendezVous = typesEvenement()
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: typesRendezVous,
      })

      // When
      const actual = await getTypesRendezVous(accessToken)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/referentiels/types-rendezvous',
        accessToken
      )
      expect(actual).toEqual(typesRendezVous)
    })
  })

  describe('.getDetailEvenement', () => {
    it('renvoie les détails de l’événement', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unEvenementJson({ nombreMaxParticipants: 10 }),
      })

      // When
      const actual = await getDetailsEvenement('id-rdv', 'accessToken')

      // Then
      expect(apiGet).toHaveBeenCalledWith('/rendezvous/id-rdv', 'accessToken')
      expect(actual).toEqual(unEvenement({ nombreMaxParticipants: 10 }))
    })

    it("renvoie undefined si l’événement n'existe pas", async () => {
      // Given
      ;(apiGet as jest.Mock).mockRejectedValue(
        new ApiError(404, 'Rdv non trouvé')
      )

      // When
      const actual = await getDetailsEvenement('id-rdv', 'accessToken')

      // Then
      expect(actual).toEqual(undefined)
    })
  })

  describe('.updateRendezVous', () => {
    it('met à jour un rendez vous déja existant', async () => {
      // Given
      const rdvFormData: EvenementFormData = {
        jeunesIds: ['beneficiaire-1', 'beneficiaire-2'],
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
        nombreMaxParticipants: 10,
      }

      // When
      await updateRendezVous('id-rdv', rdvFormData)

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/rendezvous/id-rdv',
        {
          jeunesIds: ['beneficiaire-1', 'beneficiaire-2'],
          modality: modalites[0],
          date: '2022-03-03T09:30:00.000Z',
          duration: 157,
          adresse: undefined,
          organisme: undefined,
          presenceConseiller: true,
          titre: 'Titre modifié',
          comment: 'Lorem ipsum dolor sit amet',
          nombreMaxParticipants: 10,
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
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: listeRdvs,
      })

      const dateDebut = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
      const dateFin = DateTime.fromISO('2022-09-07T23:59:59.999+02:00')

      // When
      const actual = await getRendezVousConseiller(
        idConseiller,
        dateDebut,
        dateFin
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
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
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [unEvenementJeuneJson()],
      })

      // When
      const actual = await getRendezVousJeune('id-jeune', 'PASSES', accessToken)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
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
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [
          unEvenementJeuneJson({
            type: { code: 'ATELIER', label: 'Atelier' },
            futPresent: true,
          }),
        ],
      })

      // When
      const actual = await getRendezVousJeune('id-jeune', 'PASSES', accessToken)

      // Then
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
            type: {
              code: 'INFORMATION_COLLECTIVE',
              label: 'Information collective',
            },
            date: dateDebut.toISO(),
          }),
          statut: 'A_VENIR',
        },
        {
          ...unEvenementJson({
            id: 'ac-future',
            type: { code: 'ATELIER', label: 'Atelier' },
            date: dateFin.toISO(),
          }),
          statut: 'CLOTUREE',
        },
      ]
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: animationsCollectivesJson,
      })

      // When
      const actual = await getRendezVousEtablissement(
        'id-etablissement',
        dateDebut,
        dateFin
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/etablissements/id-etablissement/animations-collectives?dateDebut=2022-09-01T00%3A00%3A00.000%2B02%3A00&dateFin=2022-09-07T23%3A59%3A59.999%2B02%3A00`,
        'accessToken'
      )
      const animationsCollectives: AnimationCollective[] = [
        uneAnimationCollective({
          id: 'ac-passee',
          type: 'Info coll',
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

  describe('.getAnimationsCollectivesACloreClientSide', () => {
    it('renvoie les animations collectives du conseiller à clore', async () => {
      // GIVEN
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          resultats: uneListeDAnimationCollectiveAClore(),
          pagination: { total: 5, limit: 10 },
        },
      })

      // WHEN
      const actual = await getAnimationsCollectivesACloreClientSide(
        'id-etablissement',
        2
      )

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/etablissements/id-etablissement/animations-collectives?aClore=true&page=2',
        'accessToken'
      )
      expect(actual).toStrictEqual({
        animationsCollectives: uneListeDAnimationCollectiveAClore(),
        metadonnees: { nombrePages: 1, nombreTotal: 5 },
      })
    })
  })

  describe('.getAnimationsCollectivesACloreServerSide', () => {
    it('renvoie les animations collectives de l’établissement à clore', async () => {
      // GIVEN
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          resultats: uneListeDAnimationCollectiveAClore(),
          pagination: { total: 5, limit: 10 },
        },
      })

      // WHEN
      const actual = await getAnimationsCollectivesACloreServerSide(
        'id-etablissement',
        'accessToken'
      )

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/v2/etablissements/id-etablissement/animations-collectives?aClore=true&page=1',
        'accessToken'
      )
      expect(actual).toStrictEqual({
        animationsCollectives: uneListeDAnimationCollectiveAClore(),
        metadonnees: { nombrePages: 1, nombreTotal: 5 },
      })
    })
  })

  describe('.creerEvenement', () => {
    it('crée un nouvel événement', async () => {
      // Given
      const rdvFormData: EvenementFormData = {
        jeunesIds: ['beneficiaire-1', 'beneficiaire-2'],
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
        nombreMaxParticipants: 10,
      }
      ;(apiPost as jest.Mock).mockResolvedValue({
        content: { id: 'id-nouvel-evenement' },
      })

      // When
      const result = await creerEvenement(rdvFormData)

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/idConseiller/rendezvous',
        {
          jeunesIds: ['beneficiaire-1', 'beneficiaire-2'],
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
          nombreMaxParticipants: 10,
        },
        'accessToken'
      )
      expect(result).toEqual('id-nouvel-evenement')
    })
  })

  describe('.supprimerEvenement', () => {
    it('supprime un événement', async () => {
      // When
      await supprimerEvenement('idEvenement')

      // Then
      expect(apiDelete).toHaveBeenCalledWith(
        '/rendezvous/idEvenement',
        'accessToken'
      )
    })
  })

  describe('.cloreAnimationCollective', () => {
    it('clôt une animation collective', async () => {
      // Given
      const idsJeunes = ['beneficiaire-1', 'beneficiaire-2']

      // When
      await cloreAnimationCollective('id-rdv', idsJeunes)

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/structures-milo/animations-collectives/id-rdv/cloturer',
        {
          idsJeunes: ['beneficiaire-1', 'beneficiaire-2'],
        },
        'accessToken'
      )
    })
  })
})
