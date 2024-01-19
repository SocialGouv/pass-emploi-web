import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'

import { TRI } from 'components/action/OngletActions'
import TableauActionsJeune from 'components/action/TableauActionsJeune'
import { uneAction } from 'fixtures/action'
import { uneBaseJeune } from 'fixtures/jeune'

describe('TableauActionsJeune', () => {
  beforeEach(async () => {
    ;(useRouter as jest.Mock).mockReturnValue({ asPath: '/mes-jeunes' })
  })

  describe('Filtre statut', () => {
    beforeEach(async () => {
      // Given
      render(
        <TableauActionsJeune
          jeune={uneBaseJeune()}
          actions={[uneAction()]}
          isLoading={false}
          onFiltres={jest.fn()}
          onTri={jest.fn()}
          tri={TRI.dateDecroissante}
        />
      )
      await userEvent.click(screen.getByText('Statut'))
      await userEvent.click(screen.getByLabelText('En cours'))
      await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
    })

    it('sauvegarde les statuts sélectionnés', async () => {
      // When
      await userEvent.click(screen.getByText('Statut'))

      // Then
      expect(
        screen.getByLabelText('Terminée - À qualifier')
      ).not.toHaveAttribute('checked')
      expect(screen.getByLabelText('En cours')).toHaveAttribute('checked')
      expect(screen.getByLabelText('Qualifiée')).not.toHaveAttribute('checked')
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
})
