import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

import TableauActionsBeneficiaire from 'components/action/TableauActionsBeneficiaire'
import { desCategories, uneAction, uneListeDActions } from 'fixtures/action'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { StatutAction } from 'interfaces/action'
import { IdentiteBeneficiaire } from 'interfaces/beneficiaire'
import { qualifierActions } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/actions.service')
jest.mock('components/ModalContainer')

describe('TableauActionsJeune', () => {
  const actions = uneListeDActions().concat(
    uneAction({
      id: 'id-action-snp-1',
      titre: 'Action SNP 1',
      status: StatutAction.TermineeAQualifier,
      qualification: {
        code: 'SNP_1',
        libelle: 'SNP 1',
        isSituationNonProfessionnelle: true,
      },
    })
  )
  let jeune: IdentiteBeneficiaire
  let rerender: (children: ReactNode) => void

  beforeEach(async () => {
    jeune = uneBaseBeneficiaire({ nom: 'Neutron', prenom: 'Jimmy' })
    ;(qualifierActions as jest.Mock).mockResolvedValue({
      idsActionsEnErreur: [],
    })
    ;(usePathname as jest.Mock).mockReturnValue('/mes-jeunes')

    const renderResult = await renderWithContexts(
      <TableauActionsBeneficiaire
        jeune={jeune}
        actions={actions}
        categories={desCategories()}
        isLoading={false}
        avecQualification={{
          onLienExterne: jest.fn(),
          onQualification: jest.fn(),
        }}
      />
    )
    rerender = renderResult.rerender
  })

  describe('filtrer les actions par status', () => {
    beforeEach(async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: 'Statut Filtrer les actions' })
      )
      await userEvent.click(screen.getByRole('radio', { name: 'À faire' }))
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Valider la sélection des statuts',
        })
      )
    })

    it('sauvegarde les statuts sélectionnés', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Statut Filtrer les actions 1 filtre sélectionné',
        })
      )

      // Then
      expect(
        screen.getByRole('radio', { name: 'Terminée - À qualifier' })
      ).not.toHaveAttribute('checked')
      expect(screen.getByRole('radio', { name: 'À faire' })).toHaveAttribute(
        'checked'
      )
      expect(
        screen.getByRole('radio', { name: 'Qualifiée' })
      ).not.toHaveAttribute('checked')
      expect(
        screen.getByRole('radio', { name: 'Annulée' })
      ).not.toHaveAttribute('checked')
    })

    it('filtre les actions', () => {
      // Then
      const tbody = screen.getAllByRole('rowgroup')[1]
      const actionRows = within(tbody).getAllByRole('row')
      expect(actionRows).toHaveLength(2)
      actionRows.forEach((row) => {
        expect(row).toHaveTextContent(/(À faire)|(En retard)/)
      })
    })

    it('conserve les filtres de statut quand les actions changent', async () => {
      // When
      rerender(
        <TableauActionsBeneficiaire
          jeune={jeune}
          actions={actions.slice(1)}
          categories={desCategories()}
          isLoading={false}
          avecQualification={{
            onLienExterne: jest.fn(),
            onQualification: jest.fn(),
          }}
        />
      )

      // Then
      const tbody = screen.getAllByRole('rowgroup')[1]
      const actionRows = within(tbody).getAllByRole('row')
      expect(actionRows).toHaveLength(1)
      actionRows.forEach((row) => {
        expect(row).toHaveTextContent(/(À faire)|(En retard)/)
      })
    })

    it('permet de réinitialiser les filtres si aucune action ne correspond', async () => {
      // Given
      const actionsPasAFaire = actions.filter(
        ({ status }) => status !== StatutAction.AFaire
      )
      rerender(
        <TableauActionsBeneficiaire
          jeune={jeune}
          actions={actionsPasAFaire}
          categories={desCategories()}
          isLoading={false}
          avecQualification={{
            onLienExterne: jest.fn(),
            onQualification: jest.fn(),
          }}
        />
      )
      expect(() => screen.getByRole('table')).toThrow()

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Réinitialiser/ })
      )

      // Then
      expect(
        within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')
      ).toHaveLength(actionsPasAFaire.length)
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Statut Filtrer les actions',
        })
      )
      expect(
        screen.getByRole('radio', { name: 'Tout sélectionner' })
      ).toHaveAttribute('checked')
    })
  })

  describe('filtrer les actions par catégories', () => {
    beforeEach(async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: 'Catégorie Filtrer les actions' })
      )
      await userEvent.click(screen.getByRole('checkbox', { name: 'SNP 1' }))
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Valider la sélection des catégories',
        })
      )
    })

    it('sauvegarde les statuts sélectionnés', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Catégorie Filtrer les actions 1 filtre sélectionné',
        })
      )

      // Then
      expect(screen.getByRole('checkbox', { name: 'SNP 1' })).toHaveAttribute(
        'checked'
      )
      expect(
        screen.getByRole('checkbox', { name: 'SNP 2' })
      ).not.toHaveAttribute('checked')
      expect(
        screen.getByRole('checkbox', { name: 'SNP 3' })
      ).not.toHaveAttribute('checked')
    })

    it('filtre les actions', () => {
      // Then
      const tbody = screen.getAllByRole('rowgroup')[1]
      const actionRows = within(tbody).getAllByRole('row')
      expect(actionRows).toHaveLength(1)
      actionRows.forEach((row) => {
        expect(row).toHaveTextContent('SNP 1')
      })
    })

    it('conserve les filtres quand les actions changent', async () => {
      // When
      rerender(
        <TableauActionsBeneficiaire
          jeune={jeune}
          actions={actions.slice(0, -1)}
          categories={desCategories()}
          isLoading={false}
          avecQualification={{
            onLienExterne: jest.fn(),
            onQualification: jest.fn(),
          }}
        />
      )

      // Then
      expect(screen.getByText('Aucun résultat.')).toBeInTheDocument()
    })

    it('permet de réinitialiser les filtres si aucune action ne correspond', async () => {
      // Given
      rerender(
        <TableauActionsBeneficiaire
          jeune={jeune}
          actions={actions.slice(0, -1)}
          categories={desCategories()}
          isLoading={false}
          avecQualification={{
            onLienExterne: jest.fn(),
            onQualification: jest.fn(),
          }}
        />
      )
      expect(() => screen.getByRole('table')).toThrow()

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Réinitialiser/ })
      )

      // Then
      expect(
        within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')
      ).toHaveLength(actions.length - 1)
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Catégorie Filtrer les actions',
        })
      )
      expect(screen.queryAllByRole('checkbox', { checked: true })).toHaveLength(
        0
      )
    })
  })

  describe("trier les actions par date d'échéance", () => {
    let headerColonneDate: HTMLButtonElement
    beforeEach(async () => {
      // Given
      headerColonneDate = screen.getByRole('button', {
        name: /Date de l’action/,
      })
    })

    it('tri les actions par ordre chronologique puis antichronologique', async () => {
      // When
      await userEvent.click(headerColonneDate)
      // Then
      const tbody = screen.getAllByRole('rowgroup')[1]
      let actionRows = within(tbody).getAllByRole('row')
      expect(actionRows[0]).toHaveTextContent(
        'Identifier ses atouts et ses compétences 20 février 2022'
      )
      expect(actionRows[1]).toHaveTextContent('Action SNP 1 20 février 2022')
      expect(actionRows[2]).toHaveTextContent(
        'Compléter son cv 20 février 2022'
      )
      expect(actionRows[3]).toHaveTextContent('21 février 2022')

      // When
      await userEvent.click(headerColonneDate)

      // Then
      actionRows = within(tbody).getAllByRole('row')
      expect(actionRows[0]).toHaveTextContent('22 février 2022')
      expect(actionRows[1]).toHaveTextContent('21 février 2022')
      expect(actionRows[2]).toHaveTextContent(
        'Identifier ses atouts et ses compétences 20 février 2022'
      )
      expect(actionRows[3]).toHaveTextContent('Action SNP 1 20 février 2022')
    })

    it('conserve le tri quand les actions changent', async () => {
      // Given
      // When
      rerender(
        <TableauActionsBeneficiaire
          jeune={jeune}
          actions={actions.slice(1, 4)}
          categories={desCategories()}
          isLoading={false}
          avecQualification={{
            onLienExterne: jest.fn(),
            onQualification: jest.fn(),
          }}
        />
      )

      // Then
      const tbody = screen.getAllByRole('rowgroup')[1]
      const actionRows = within(tbody).getAllByRole('row')
      expect(actionRows[0]).toHaveTextContent('22 février 2022')
      expect(actionRows[1]).toHaveTextContent('21 février 2022')
      expect(actionRows[2]).toHaveTextContent(
        'Compléter son cv 20 février 2022'
      )
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
          name: 'Catégorie Filtrer les actions',
        })
      ).toBeInTheDocument()
      expect(
        within(tableauDActions).getByRole('columnheader', {
          name: 'Statut Filtrer les actions',
        })
      ).toBeInTheDocument()
    })

    it('affiche information catégorie manquante', async () => {
      // Then
      expect(
        screen.getByRole('row', { name: /Compléter son cv/ })
      ).toHaveTextContent('Catégorie manquante')
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
              name: /Sélection Consulter les offres d'emploi/,
            })
          )
        })

        it('permet de qualifier l’action', async () => {
          //Then
          expect(
            screen.getByRole('checkbox', {
              name: /Sélection Consulter les offres d'emploi/,
            })
          ).toBeChecked()
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
