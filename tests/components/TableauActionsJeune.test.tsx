import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TRI } from 'components/action/OngletActions'
import TableauActionsJeune from 'components/action/TableauActionsJeune'
import { uneListeDActions } from 'fixtures/action'
import { uneBaseJeune } from 'fixtures/jeune'
import { EtatQualificationAction, StatutAction } from 'interfaces/action'

describe('TableauActionsJeune', () => {
  beforeEach(() => {
    // Given
    render(
      <TableauActionsJeune
        jeune={uneBaseJeune()}
        actions={[]}
        isLoading={false}
        onFiltres={jest.fn()}
        onTri={jest.fn()}
        tri={TRI.dateDecroissante}
      />
    )
  })

  describe('Filtre statut', () => {
    beforeEach(async () => {
      // Given
      await userEvent.click(screen.getByText('Statut'))
      await userEvent.click(screen.getByLabelText('Commencée'))
      await userEvent.click(screen.getByLabelText('À réaliser'))
      await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    })

    it('sauvegarde les statuts sélectionnés', async () => {
      // When
      await userEvent.click(screen.getByText('Statut'))

      // Then
      expect(screen.getByLabelText('Terminée')).not.toHaveAttribute('checked')
      expect(screen.getByLabelText('Commencée')).toHaveAttribute('checked')
      expect(screen.getByLabelText('À réaliser')).toHaveAttribute('checked')
      expect(screen.getByLabelText('Annulée')).not.toHaveAttribute('checked')
    })

    xit('permet de réinitialiser les filtres', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Réinitialiser/ })
      )

      // Then
      await userEvent.click(
        screen.getByRole('button', { name: /qualification/ })
      )
      await waitFor(() => {
        expect(
          screen.getByLabelText('Actions non qualifiables')
        ).not.toHaveAttribute('checked')
        expect(
          screen.getByLabelText('Actions à qualifier')
        ).not.toHaveAttribute('checked')
        expect(screen.getByLabelText('Actions qualifiées')).not.toHaveAttribute(
          'checked'
        )
      })
    })
  })

  describe('Filtre etats qualification', () => {
    beforeEach(async () => {
      // Given
      await userEvent.click(
        screen.getByRole('button', { name: /qualification/ })
      )
      await userEvent.click(screen.getByLabelText('Actions à qualifier'))
      await userEvent.click(screen.getByLabelText('Actions qualifiées'))
      await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    })

    it('sauvegarde les états de qualification sélectionnés', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: /qualification/ })
      )

      // Then
      expect(
        screen.getByLabelText('Actions non qualifiables')
      ).not.toHaveAttribute('checked')
      expect(screen.getByLabelText('Actions à qualifier')).toHaveAttribute(
        'checked'
      )
      expect(screen.getByLabelText('Actions qualifiées')).toHaveAttribute(
        'checked'
      )
    })

    xit('permet de réinitialiser les filtres', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Réinitialiser/ })
      )

      // Then
      await userEvent.click(
        screen.getByRole('button', { name: /qualification/ })
      )
      await waitFor(() => {
        expect(
          screen.getByLabelText('Actions non qualifiables')
        ).not.toHaveAttribute('checked')
        expect(
          screen.getByLabelText('Actions à qualifier')
        ).not.toHaveAttribute('checked')
        expect(screen.getByLabelText('Actions qualifiées')).not.toHaveAttribute(
          'checked'
        )
      })
    })
  })
})
