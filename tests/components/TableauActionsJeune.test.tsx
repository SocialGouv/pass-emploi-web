import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import { uneListeDActions } from 'fixtures/action'
import { uneBaseJeune } from 'fixtures/jeune'

describe('TableauActionsJeune', () => {
  describe('Filtre statut', () => {
    it('affiche une liste de statut', async () => {
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
      expect(screen.getByLabelText('Commencée')).toBeInTheDocument()
      expect(screen.getByLabelText('À réaliser')).toBeInTheDocument()
      expect(screen.getByLabelText('Terminée')).toBeInTheDocument()
      expect(screen.getByLabelText('Annulée')).toBeInTheDocument()
    })
  })
})
