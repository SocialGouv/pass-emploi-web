import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TRI } from 'components/action/OngletActions'
import TableauActionsJeune from 'components/action/TableauActionsJeune'
import { uneListeDActions } from 'fixtures/action'
import { uneBaseJeune } from 'fixtures/jeune'
import { EtatQualificationAction, StatutAction } from 'interfaces/action'

describe('TableauActionsJeune', () => {
  describe('Filtre statut', () => {
    let filtrerActions: (filtres: {
      statuts: StatutAction[]
      etatsQualification: EtatQualificationAction[]
    }) => void
    beforeEach(async () => {
      // Given
      filtrerActions = jest.fn()
      render(
        <TableauActionsJeune
          jeune={uneBaseJeune()}
          actions={uneListeDActions()}
          isLoading={false}
          onFiltres={filtrerActions}
          onTri={jest.fn()}
          tri={TRI.dateDecroissante}
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
        screen.getByRole('group', {
          name: 'Choisir un ou plusieurs statuts à filtrer',
        })
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
        expect(filtrerActions).toHaveBeenCalledWith({
          statuts: [StatutAction.Commencee, StatutAction.ARealiser],
          etatsQualification: [],
        })
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

  describe('Filtre etats qualification', () => {
    it('sauvegarde les états de qualification sélectionnés', async () => {
      // Given
      render(
        <TableauActionsJeune
          jeune={uneBaseJeune()}
          actions={uneListeDActions()}
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

      // When
      await userEvent.click(screen.getByRole('button', { name: 'Valider' }))

      // Then
      await userEvent.click(
        screen.getByRole('button', { name: /qualification/ })
      )
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
      await userEvent.click(
        screen.getByRole('button', { name: /qualification/ })
      )
      await userEvent.click(screen.getByLabelText('Actions à qualifier'))
      await userEvent.click(screen.getByLabelText('Actions qualifiées'))
      await userEvent.click(screen.getByRole('button', { name: 'Valider' }))

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
