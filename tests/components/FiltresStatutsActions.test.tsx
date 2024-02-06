import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import FiltresStatutsActions from 'components/action/FiltresStatutsActions'
import { StatutAction } from 'interfaces/action'

describe('FiltresStatutsAction', () => {
  let filtrerActions: (statutsSelectionnes: StatutAction[]) => void
  beforeEach(async () => {
    // Given
    filtrerActions = jest.fn()
    render(<FiltresStatutsActions onFiltres={filtrerActions} />)

    // When
    await userEvent.click(screen.getByText('Statut'))
  })

  it('affiche une liste de statuts', async () => {
    // Then
    expect(
      screen.getByRole('group', {
        name: 'Choisir un ou plusieurs statuts à filtrer',
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'À Faire' })).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: 'Terminée - À qualifier' })
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Qualifiée' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Annulée' })).toBeInTheDocument()
  })

  it('cache la liste de statuts', async () => {
    // When
    await userEvent.click(screen.getByText('Statut'))

    // Then
    expect(() =>
      screen.getByRole('group', {
        name: 'Choisir un ou plusieurs statuts à filtrer',
      })
    ).toThrow()
  })

  it('réinitialise les statuts non validés', async () => {
    // Given
    await userEvent.click(screen.getByLabelText('À Faire'))
    await userEvent.click(screen.getByText('Statut'))

    // When
    await userEvent.click(screen.getByText('Statut'))

    // Then
    expect(screen.getByLabelText('Tout sélectionner')).toHaveAttribute(
      'checked'
    )
    expect(screen.getByLabelText('À Faire')).not.toHaveAttribute('checked')
  })

  it('filtre les actions avec le statut sélectionné', async () => {
    // Given
    await userEvent.click(screen.getByLabelText('À Faire'))
    await userEvent.click(screen.getByLabelText('Annulée'))

    // When
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))

    // Then
    expect(filtrerActions).toHaveBeenCalledWith([StatutAction.Annulee])
  })
})
