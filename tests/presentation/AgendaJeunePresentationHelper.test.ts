import { uneAction } from 'fixtures/action'
import { unRdvListItem } from 'fixtures/rendez-vous'
import { fusionneEtTriActionsEtRendezVous } from 'presentation/AgendaJeunePresentationHelper'

describe('.fusionneEtTriActionsEtRendezVous', () => {
  it('fusionne les 2 listes et les tris par ordre chronologique', () => {
    // Given
    const actionDu1 = uneAction({
      id: 'action-du-1-janvier',
      dateEcheance: '2022-01-01T14:50:46.000Z',
    })
    const rdvDu2 = unRdvListItem({
      id: 'rendezVous-du-2-janvier',
      date: '2022-01-02T10:00:00.000Z',
    })
    const actionDu3 = uneAction({
      id: 'action-du-3-janvier',
      dateEcheance: '2022-01-03T14:50:46.000Z',
    })
    const rdvDu4 = unRdvListItem({
      id: 'rendezVous-du-4-janvier',
      date: '2022-01-04T10:00:00.000Z',
    })

    // When
    const resultat = fusionneEtTriActionsEtRendezVous(
      [actionDu3, actionDu1],
      [rdvDu2, rdvDu4]
    )

    // Then
    expect(resultat).toEqual([actionDu1, rdvDu2, actionDu3, rdvDu4])
  })
})
