import { DateTime } from 'luxon'

import { apiGet } from 'clients/api.client'
import { uneListeDActionsJson } from 'fixtures/action'
import { uneListeDEvenementJson } from 'fixtures/evenement'
import { StructureConseiller } from 'interfaces/conseiller'
import { recupererAgenda } from 'services/agenda.service'

jest.mock('clients/api.client')

describe('AgendaService', () => {
  describe('.recupererAgenda', () => {
    it('renvoie des actions et des items rendez-vous', async () => {
      // Given
      const maintenant = DateTime.fromISO('2022-09-01T00:00:00.000+02:00')
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: {
          actions: uneListeDActionsJson(),
          rendezVous: uneListeDEvenementJson(),
          metadata: {
            dateDeDebut: '2022-09-01T00:00:00.000+02:00',
            dateDeFin: '2022-09-14T00:00:00.000+02:00',
            actionsEnRetard: '8',
          },
        },
      })

      // When
      const actual = await recupererAgenda('jeune-1', maintenant)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/jeunes/jeune-1/home/agenda?maintenant=2022-09-01T00%3A00%3A00.000%2B02%3A00',
        'accessToken'
      )
      expect(actual).toEqual({
        entrees: [
          {
            id: '1',
            date: DateTime.fromISO('2021-10-21T10:00:00.000Z'),
            titre: '12h00 - Prise de nouvelles par téléphone',
            type: 'evenement',
            source: StructureConseiller.PASS_EMPLOI,
          },
          {
            id: '1',
            date: DateTime.fromISO('2021-10-21T10:00:00.000Z'),
            titre: '12h00 - Prise de nouvelles par téléphone',
            type: 'evenement',
            source: StructureConseiller.PASS_EMPLOI,
          },
          {
            id: 'id-action-1',
            date: DateTime.fromISO('2022-02-20T14:50:46.000Z'),
            statut: 'ARealiser',
            titre: 'Identifier ses atouts et ses compétences',
            type: 'action',
          },
          {
            id: 'id-action-2',
            date: DateTime.fromISO('2022-02-20T14:50:46.000Z'),
            statut: 'Commencee',
            titre: 'Compléter son cv',
            type: 'action',
          },
          {
            id: 'id-action-3',
            date: DateTime.fromISO('2022-02-21T14:50:46.000Z'),
            statut: 'Terminee',
            titre: 'Chercher une formation',
            type: 'action',
          },
          {
            id: 'id-action-4',
            date: DateTime.fromISO('2022-02-22T14:50:46.000Z'),
            statut: 'Terminee',
            titre: "Consulter les offres d'emploi",
            type: 'action',
          },
        ],
        metadata: {
          dateDeDebut: DateTime.fromISO('2022-09-01T00:00:00.000+02:00'),
          dateDeFin: DateTime.fromISO('2022-09-14T00:00:00.000+02:00'),
          actionsEnRetard: 8,
        },
      })
    })
  })
})
