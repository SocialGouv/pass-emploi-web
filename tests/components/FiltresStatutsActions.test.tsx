import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import FiltresStatuts from 'components/action/FiltresStatuts'
import { StatutAction } from 'interfaces/action'
import propsStatutsActions from 'components/action/propsStatutsActions'

describe('FiltresStatuts', () => {
  let filtrerActions: (statutsSelectionnes: StatutAction[]) => void
  beforeEach(async () => {
    // Given
    filtrerActions = jest.fn()
    render(
      <FiltresStatuts
        defaultValue={[]}
        onFiltres={filtrerActions}
        statuts={Object.keys(StatutAction)}
        entites='actions'
        propsStatuts={propsStatutsActions}
      />
    )

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
    expect(screen.getByRole('radio', { name: 'À faire' })).toBeInTheDocument()
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
    await userEvent.click(screen.getByLabelText('À faire'))
    await userEvent.click(screen.getByText('Statut'))

    // When
    await userEvent.click(screen.getByText('Statut'))

    // Then
    expect(screen.getByLabelText('Tout sélectionner')).toHaveAttribute(
      'checked'
    )
    expect(screen.getByLabelText('À faire')).not.toHaveAttribute('checked')
  })

  it('filtre les actions avec le statut sélectionné', async () => {
    // Given
    await userEvent.click(screen.getByLabelText('À faire'))
    await userEvent.click(screen.getByLabelText('Annulée'))

    // When
    await userEvent.click(
      screen.getByRole('button', { name: 'Valider la sélection des statuts' })
    )

    // Then
    expect(filtrerActions).toHaveBeenCalledWith([StatutAction.Annulee])
  })
})
