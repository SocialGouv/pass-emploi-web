import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StatutAction } from '../../interfaces/action'

import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import { uneListeDActions } from 'fixtures/action'
import { uneBaseJeune } from 'fixtures/jeune'

describe('TableauActionsJeune', () => {
  describe('Filtre statut', () => {
    let filtrerActions: (statutsSelectionnes: StatutAction[]) => void
    beforeEach(async () => {
      // Given
      filtrerActions = jest.fn()
      render(
        <TableauActionsJeune
          jeune={uneBaseJeune()}
          actions={uneListeDActions()}
          isLoading={false}
          filtrerActions={filtrerActions}
        />
      )

      // When
      await userEvent.click(screen.getByText('Statut'))
    })

    it('affiche une liste de statuts', async () => {
      // Then
      expect(
        screen.getByRole('group', { name: 'Choisir un statut à filtrer' })
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Commencée')).toBeInTheDocument()
      expect(screen.getByLabelText('À réaliser')).toBeInTheDocument()
      expect(screen.getByLabelText('Terminée')).toBeInTheDocument()
      expect(screen.getByLabelText('Annulée')).toBeInTheDocument()
    })

    it('cache la liste de statuts', async () => {
      // When
      await userEvent.click(screen.getByText('Statut'))

      // Then
      expect(() =>
        screen.getByRole('group', { name: 'Choisir un statut à filtrer' })
      ).toThrow()
    })

    it('réinitialise les statuts non validés', async () => {
      // Given
      await userEvent.click(screen.getByLabelText('À réaliser'))
      await userEvent.click(screen.getByLabelText('Terminée'))
      await userEvent.click(screen.getByText('Statut'))

      // When
      await userEvent.click(screen.getByText('Statut'))

      // Then
      expect(screen.getByLabelText('Terminée')).not.toHaveAttribute('checked')
      expect(screen.getByLabelText('Commencée')).not.toHaveAttribute('checked')
      expect(screen.getByLabelText('À réaliser')).not.toHaveAttribute('checked')
      expect(screen.getByLabelText('Annulée')).not.toHaveAttribute('checked')
    })

    describe('quand on valide les statuts sélectionnés', () => {
      beforeEach(async () => {
        // Given
        await userEvent.click(screen.getByLabelText('Terminée'))
        await userEvent.click(screen.getByLabelText('Commencée'))
        await userEvent.click(screen.getByLabelText('À réaliser'))
        await userEvent.click(screen.getByLabelText('Terminée'))

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
      })

      it('filtre les actions avec les statuts sélectionnés', async () => {
        // Then
        expect(filtrerActions).toHaveBeenCalledWith([
          StatutAction.Commencee,
          StatutAction.ARealiser,
        ])
      })

      it('ne réinitialise pas les statuts sélectionnés', async () => {
        // Given
        await userEvent.click(screen.getByText('Statut'))

        // Then
        expect(screen.getByLabelText('Terminée')).not.toHaveAttribute('checked')
        expect(screen.getByLabelText('Commencée')).toHaveAttribute('checked')
        expect(screen.getByLabelText('À réaliser')).toHaveAttribute('checked')
        expect(screen.getByLabelText('Annulée')).not.toHaveAttribute('checked')
      })
    })
  })
})
