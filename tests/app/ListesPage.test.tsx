import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'

import ListesPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/listes/ListesPage'
import { desListes } from 'fixtures/listes'
import { Liste } from 'interfaces/liste'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('components/PageActionsPortal')

describe('Page Listes de ', () => {
  let container: HTMLElement
  describe('contenu', () => {
    beforeEach(async () => {
      ;({ container } = await renderWithContexts(<ListesPage listes={[]} />))
    })

    it('a11y', async () => {
      let results: AxeResults
      await act(async () => {
        results = await axe(container)
      })
      expect(results!).toHaveNoViolations()
    })

    it('afficher un lien pour créer une liste', () => {
      // Given - When
      const pageActionPortal = screen.getByTestId('page-action-portal')

      // Then
      expect(
        within(pageActionPortal).getByRole('link', {
          name: 'Créer une liste',
        })
      ).toHaveAttribute('href', '/mes-jeunes/listes/edition-liste')
    })
  })

  describe('quand il n’y a pas de listes', () => {
    beforeEach(async () => {
      // Given - When
      ;({ container } = await renderWithContexts(<ListesPage listes={[]} />))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('affiche le message idoine', async () => {
      // Then
      expect(
        screen.getByText('Vous n’avez pas encore créé de liste.')
      ).toBeInTheDocument()
    })

    it('affiche un empty state comprenant un lien pour créer une liste', () => {
      const emptyState = screen.getByTestId('empty-state-liste')

      // Then
      expect(
        within(emptyState).getByRole('link', {
          name: 'Créer une liste',
        })
      ).toHaveAttribute('href', '/mes-jeunes/listes/edition-liste')
    })
  })

  describe('quand il y a des listes', () => {
    let listeListes: Liste[]
    beforeEach(async () => {
      // Given
      listeListes = desListes()
      // When
      ;({ container } = await renderWithContexts(
        <ListesPage listes={listeListes} />
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('affiche les informations des listes', () => {
      // Then
      expect(screen.getByText('Liste export international')).toBeInTheDocument()
      expect(screen.getByText('Liste métiers pâtisserie')).toBeInTheDocument()
      expect(screen.getAllByText('1 destinataire(s)')).toHaveLength(2)
      expect(
        screen.getByLabelText(
          'Un ou plusieurs bénéficiaires de cette liste ont été réaffectés temporairement.'
        )
      ).toBeInTheDocument()
    })

    it('permet de modifier la liste', () => {
      // Then
      listeListes.forEach((liste) => {
        expect(
          screen.getByRole('link', {
            name: `Consulter la liste ${liste.titre} ${liste.beneficiaires.length} destinataire(s)`,
          })
        ).toHaveAttribute(
          'href',
          '/mes-jeunes/listes/edition-liste?idListe=' + liste.id
        )
      })
    })

    it('affiche le nombre de listes', () => {
      // Then
      expect(
        screen.getByRole('table', { name: 'Listes (2 éléments)' })
      ).toBeInTheDocument()
    })

    it('permet de trier les listes par ordre alphabétique inversé', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Trier les listes par ordre alphabétique inversé',
        })
      )

      // Then
      const [_header, ...listes] = screen.getAllByRole('row')
      expect(listes[0]).toHaveAccessibleName(new RegExp(listeListes[1].titre))
      expect(listes[1]).toHaveAccessibleName(new RegExp(listeListes[0].titre))
    })

    it('permet de trier les listes par ordre alphabétique', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Trier les listes par ordre alphabétique inversé',
        })
      )
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Trier les listes par ordre alphabétique',
        })
      )

      // Then
      const [_header, ...listes] = screen.getAllByRole('row')
      expect(listes[0]).toHaveAccessibleName(new RegExp(listeListes[0].titre))
      expect(listes[1]).toHaveAccessibleName(new RegExp(listeListes[1].titre))
    })
  })
})
