import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import { uneListeDActions } from 'fixtures/action'
import { uneBaseJeune } from 'fixtures/jeune'

describe('TableauActionsJeune', () => {
  describe('Filtre statut', () => {
    it('affiche une liste de statuts', async () => {
      // Given
      render(
        <TableauActionsJeune
          jeune={uneBaseJeune()}
          actions={uneListeDActions()}
          isLoading={false}
        />
      )

      // When
      await userEvent.click(screen.getByText('Statut'))

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
      // Given
      render(
        <TableauActionsJeune
          jeune={uneBaseJeune()}
          actions={uneListeDActions()}
          isLoading={false}
        />
      )
      await userEvent.click(screen.getByText('Statut'))

      // When
      await userEvent.click(screen.getByText('Statut'))

      // Then
      expect(() =>
        screen.getByRole('group', { name: 'Choisir un statut à filtrer' })
      ).toThrow()
    })
  })
})
