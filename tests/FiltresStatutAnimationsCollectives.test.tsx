import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import FiltresStatutAnimationsCollectives from 'components/rdv/FiltresStatutAnimationsCollectives'
import { StatutAnimationCollective } from 'interfaces/evenement'

describe('FiltresStatutAnimationsCollectives', () => {
  let filtrerAnimationsCollectives: (
    statutACSelectionnees: StatutAnimationCollective[]
  ) => void
  beforeEach(async () => {
    // Given
    filtrerAnimationsCollectives = jest.fn()
    render(
      <FiltresStatutAnimationsCollectives
        defaultValue={[]}
        onFiltres={filtrerAnimationsCollectives}
      />
    )

    // When
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Statuts Filtrer les animations collectives',
      })
    )
  })

  it('affiche une liste de statuts', async () => {
    // Then
    expect(
      screen.getByRole('group', {
        name: 'Choisir un ou plusieurs statuts à filtrer',
      })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('À venir')).toBeInTheDocument()
    expect(screen.getByLabelText('À clore')).toBeInTheDocument()
    expect(screen.getByLabelText('Clos')).toBeInTheDocument()
  })

  it('cache la liste des statuts', async () => {
    // When
    await userEvent.click(screen.getByRole('button', { name: /Statut/ }))

    // Then
    expect(() =>
      screen.getByRole('group', {
        name: 'Choisir un ou plusieurs états de qualification à filtrer',
      })
    ).toThrow()
  })

  it('réinitialise les statuts non validés', async () => {
    // Given
    await userEvent.click(screen.getByLabelText('À venir'))
    await userEvent.click(screen.getByLabelText('À clore'))
    await userEvent.click(screen.getByRole('button', { name: /Statut/ }))

    // When
    await userEvent.click(screen.getByRole('button', { name: /Statut/ }))

    // Then
    expect(screen.getByLabelText('À venir')).not.toHaveAttribute('checked')
    expect(screen.getByLabelText('À clore')).not.toHaveAttribute('checked')
    expect(screen.getByLabelText('Clos')).not.toHaveAttribute('checked')
  })

  it('filtre les animations collectives avec les statuts sélectionnés', async () => {
    // Given
    await userEvent.click(screen.getByLabelText('Clos'))
    await userEvent.click(screen.getByLabelText('À clore'))
    await userEvent.click(screen.getByLabelText('À venir'))
    await userEvent.click(screen.getByLabelText('À venir'))

    // When
    await userEvent.click(
      screen.getByRole('button', { name: 'Valider la sélection des statuts' })
    )

    // Then
    expect(filtrerAnimationsCollectives).toHaveBeenCalledWith([
      StatutAnimationCollective.Close,
      StatutAnimationCollective.AClore,
    ])
  })
})
