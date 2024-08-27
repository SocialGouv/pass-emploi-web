import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePathname } from 'next/navigation'

import { TRI } from 'components/action/OngletActions'
import TableauActionsJeune from 'components/action/TableauActionsJeune'
import { desCategories, uneAction, uneListeDActions } from 'fixtures/action'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { Action, StatutAction } from 'interfaces/action'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import { qualifierActions } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/actions.service')
jest.mock('components/Modal')

describe('TableauActionsJeune', () => {
  let actions: Action[]
  let actionSansCategorie: Action
  let actionAvecCategorie: Action
  let jeune: BaseBeneficiaire

  beforeEach(async () => {
    actions = uneListeDActions()
    actionSansCategorie = uneAction({
      id: 'id-action-sans-categorie',
      content: 'Regarder Tchoupi faire du tricycle',
      qualification: undefined,
    })
    actionAvecCategorie = uneAction({
      id: 'id-action-avec-categorie',
      content: 'Cueillir des champignons avec Petit Ours',
      status: StatutAction.Terminee,
      qualification: {
        code: 'SANTE',
        libelle: 'Santé',
        isSituationNonProfessionnelle: true,
      },
    })
    jeune = uneBaseBeneficiaire({ nom: 'Neutron', prenom: 'Jimmy' })
    ;(qualifierActions as jest.Mock).mockResolvedValue({
      idsActionsEnErreur: [],
    })
    ;(usePathname as jest.Mock).mockReturnValue('/mes-jeunes')

    await act(async () =>
      renderWithContexts(
        <TableauActionsJeune
          jeune={jeune}
          actionsFiltrees={[
            ...actions,
            actionSansCategorie,
            actionAvecCategorie,
          ]}
          categories={desCategories()}
          isLoading={false}
          onFiltres={jest.fn()}
          onTri={jest.fn()}
          onLienExterne={jest.fn()}
          onQualification={jest.fn()}
          tri={TRI.dateDecroissante}
        />
      )
    )
  })

  describe('Filtre statut', () => {
    beforeEach(async () => {
      // Given
      await userEvent.click(screen.getByText('Statut'))
      await userEvent.click(screen.getByLabelText('À faire'))
      await userEvent.click(
        screen.getByRole('button', { name: 'Valider Statuts' })
      )
    })

    it('sauvegarde les statuts sélectionnés', async () => {
      // When
      await userEvent.click(screen.getByText('Statut'))

      // Then
      expect(
        screen.getByLabelText('Terminée - À qualifier')
      ).not.toHaveAttribute('checked')
      expect(screen.getByLabelText('À faire')).toHaveAttribute('checked')
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

  describe('multi-qualification', () => {
    it('affiche un tableau d’actions à qualifier ', () => {
      // Given
      const tableauDActions = screen.getByRole('table', {
        name: /Liste des actions/,
      })

      // Then
      expect(
        within(tableauDActions).getByRole('columnheader', {
          name: 'Titre de l’action',
        })
      ).toBeInTheDocument()
      expect(
        within(tableauDActions).getByRole('columnheader', {
          name: 'Date de l’action',
        })
      ).toBeInTheDocument()
      expect(
        within(tableauDActions).getByRole('columnheader', {
          name: 'Catégorie',
        })
      ).toBeInTheDocument()
      expect(
        within(tableauDActions).getByRole('columnheader', {
          name: 'Statut',
        })
      ).toBeInTheDocument()
    })

    it('affiche information catégorie manquante', async () => {
      // Then
      expect(
        within(
          screen.getByRole('row', {
            name: /Regarder Tchoupi faire du tricycle/,
          })
        ).getByText('Catégorie manquante')
      ).toBeInTheDocument()
    })

    describe('multi-qualification', () => {
      describe('quand aucune action n’est sélectionnée', () => {
        it('invite à sélectionner une action', () => {
          expect(
            screen.getByText(
              'Sélectionnez au moins un élément ci-dessous pour commencer à qualifier'
            )
          ).toBeInTheDocument()
        })

        it('désactive la qualification', () => {
          expect(
            screen.getByRole('button', {
              name: 'Enregistrer les actions en non SNP',
            })
          ).toHaveAttribute('disabled')
          expect(
            screen.getByRole('button', {
              name: 'Qualifier les actions en SNP',
            })
          ).toHaveAttribute('disabled')
        })
      })

      describe('quand une action est sélectionnée', () => {
        beforeEach(async () => {
          await userEvent.click(
            screen.getByRole('checkbox', {
              name: /Sélection Cueillir des champignons avec Petit Ours/,
            })
          )
        })

        it('permet de qualifier l’action', async () => {
          //Then
          expect(
            screen.getByRole('checkbox', {
              name: /Sélection Cueillir des champignons avec Petit Ours/,
            })
          ).toBeChecked
          expect(
            screen.getByText(
              '1 action sélectionnée. S’agit-il de SNP ou de non SNP ?'
            )
          ).toBeInTheDocument()
        })
      })
    })
  })
})
