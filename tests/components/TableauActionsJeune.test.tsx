import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TRI } from 'components/action/OngletActions'
import TableauActionsJeune from 'components/action/TableauActionsJeune'
import { uneAction } from 'fixtures/action'
import { uneBaseJeune } from 'fixtures/jeune'

describe('TableauActionsJeune', () => {
  describe('Filtre statut', () => {
    beforeEach(async () => {
      // Given
      render(
        <TableauActionsJeune
          afficherFiltresEtatsQualification={false}
          jeune={uneBaseJeune()}
          actions={[uneAction()]}
          isLoading={false}
          onFiltres={jest.fn()}
          onTri={jest.fn()}
          tri={TRI.dateDecroissante}
        />
      )
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
    describe('pour un conseiller Milo', () => {
      beforeEach(async () => {
        // Given
        render(
          <TableauActionsJeune
            afficherFiltresEtatsQualification={true}
            jeune={uneBaseJeune()}
            actions={[]}
            isLoading={false}
            onFiltres={jest.fn()}
            onTri={jest.fn()}
            tri={TRI.dateDecroissante}
          />
        )
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
          expect(
            screen.getByLabelText('Actions qualifiées')
          ).not.toHaveAttribute('checked')
        })
      })
    })

    describe('pour un conseiller par Milo', () => {
      it('ne permet pas de filter par états de qualification', () => {
        // Given
        render(
          <TableauActionsJeune
            afficherFiltresEtatsQualification={false}
            jeune={uneBaseJeune()}
            actions={[]}
            isLoading={false}
            onFiltres={jest.fn()}
            onTri={jest.fn()}
            tri={TRI.dateDecroissante}
          />
        )

        // Then
        expect(() => screen.getByText(/qualification/)).toThrow()
      })
    })
  })
})
