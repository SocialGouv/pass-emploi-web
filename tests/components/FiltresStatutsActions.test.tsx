import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import FiltresStatutsActions from 'components/action/FiltresStatutsActions'
import { StatutAction } from 'interfaces/action'

describe('FiltresStatutsAction', () => {
  let filtrerActions: (statutsSelectionnes: StatutAction[]) => void
  beforeEach(async () => {
    // Given
    filtrerActions = jest.fn()
    render(<FiltresStatutsActions style='' onFiltres={filtrerActions} />)

    // When
    await act(() => userEvent.click(screen.getByText('Statut')))
  })

  it('affiche une liste de statuts', async () => {
    // Then
    expect(
      screen.getByRole('group', {
        name: 'Choisir un ou plusieurs statuts à filtrer',
      })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Commencée')).toBeInTheDocument()
    expect(screen.getByLabelText('À réaliser')).toBeInTheDocument()
    expect(screen.getByLabelText('Terminée')).toBeInTheDocument()
    expect(screen.getByLabelText('Annulée')).toBeInTheDocument()
  })

  it('cache la liste de statuts', async () => {
    // When
    await act(() => userEvent.click(screen.getByText('Statut')))

    // Then
    expect(() =>
      screen.getByRole('group', {
        name: 'Choisir un ou plusieurs statuts à filtrer',
      })
    ).toThrow()
  })

  it('réinitialise les statuts non validés', async () => {
    // Given
    await act(async () => {
      await userEvent.click(screen.getByLabelText('À réaliser'))
      await userEvent.click(screen.getByLabelText('Terminée'))
      await userEvent.click(screen.getByText('Statut'))
    })

    // When
    await act(() => userEvent.click(screen.getByText('Statut')))

    // Then
    expect(screen.getByLabelText('Terminée')).not.toHaveAttribute('checked')
    expect(screen.getByLabelText('Commencée')).not.toHaveAttribute('checked')
    expect(screen.getByLabelText('À réaliser')).not.toHaveAttribute('checked')
    expect(screen.getByLabelText('Annulée')).not.toHaveAttribute('checked')
  })

  it('filtre les actions avec les statuts sélectionnés', async () => {
    // Given
    await act(async () => {
      await userEvent.click(screen.getByLabelText('Terminée'))
      await userEvent.click(screen.getByLabelText('Commencée'))
      await userEvent.click(screen.getByLabelText('À réaliser'))
      await userEvent.click(screen.getByLabelText('Terminée'))
    })

    // When
    await act(() =>
      userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    )

    // Then
    expect(filtrerActions).toHaveBeenCalledWith([
      StatutAction.Commencee,
      StatutAction.ARealiser,
    ])
  })
})
