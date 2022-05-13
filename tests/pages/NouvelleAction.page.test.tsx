import { act, fireEvent, screen, within } from '@testing-library/react'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import renderWithSession from '../renderWithSession'

import { mockedActionsService } from 'fixtures/services'
import NouvelleAction, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions/nouvelle-action'
import { actionsPredefinies } from 'referentiel/action'
import { ActionsService } from 'services/actions.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { DIProvider } from 'utils/injectionDependances'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('NouvelleAction', () => {
  describe('server side', () => {
    describe("quand l'utilisateur n'est pas connecté", () => {
      it('requiert la connexion', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: false,
          redirect: { destination: 'whatever' },
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ redirect: { destination: 'whatever' } })
      })
    })

    describe("quand l'utilisateur est connecté", () => {
      it("récupère l'id du jeune", async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {},
        })

        // When
        const actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: {
            idJeune: 'id-jeune',
            withoutChat: true,
            pageTitle: 'Actions jeune – Création action',
          },
        })
      })
    })
  })

  describe('client side', () => {
    let actionsService: ActionsService
    let push: Function
    beforeEach(async () => {
      // Given
      push = jest.fn(async () => {})
      ;(useRouter as jest.Mock).mockReturnValue({ push })
      actionsService = mockedActionsService()

      // When
      await act(async () => {
        renderWithSession(
          <DIProvider dependances={{ actionsService }}>
            <NouvelleAction
              idJeune='id-jeune'
              withoutChat={true}
              pageTitle=''
            />
          </DIProvider>
        )
      })
    })

    it('contient un titre', () => {
      // Then
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Créer une nouvelle action',
        })
      ).toBeInTheDocument()
    })

    it('permet de revenir à la page précédente', () => {
      // Then
      expect(
        screen.getByRole('link', {
          hidden: true,
          name: 'Page précédente',
        })
      ).toHaveAttribute('href', '/mes-jeunes/id-jeune/actions')
      expect(screen.getByText('Page précédente')).toHaveAttribute(
        'class',
        'sr-only'
      )
    })

    it("permet d'annuler la création de l'action", () => {
      // Then
      expect(
        screen.getByRole('link', {
          hidden: true,
          name: 'Annuler',
        })
      ).toHaveAttribute('href', '/mes-jeunes/id-jeune/actions')
    })

    it('contient 2 onglets', () => {
      // Then
      const tablist = screen.getByRole('tablist')
      expect(
        within(tablist).getByRole('tab', { name: 'Action prédéfinie' })
      ).toBeInTheDocument()
      expect(
        within(tablist).getByRole('tab', { name: 'Action personnalisée' })
      ).toBeInTheDocument()
    })

    describe('dans l\'onglet "Action prédéfinie" (défaut)', () => {
      it('contient une liste des actions prédéfinies', () => {
        // Then
        const select = screen.getByRole('combobox', {
          name: '* Choisir une action prédéfinie',
        })

        expect(select).toHaveAttribute('required', '')
        actionsPredefinies.forEach(({ content }) => {
          expect(
            within(select).getByRole('option', { name: content })
          ).toBeInTheDocument()
        })
      })

      it('contient un champ pour saisir un commentaire', () => {
        // Then
        expect(
          screen.getByRole('textbox', { name: "Commentaire de l'action" })
        ).not.toHaveAttribute('required')
      })

      describe('action prédéfinie remplie', () => {
        let selectAction: HTMLSelectElement
        let submit: HTMLButtonElement
        beforeEach(() => {
          // Given
          selectAction = screen.getByRole('combobox', {
            name: /Choisir une action/,
          })
          const commentaire = screen.getByRole('textbox', {
            name: /Commentaire/,
          })
          submit = screen.getByRole('button', { name: 'Envoyer' })

          fireEvent.change(selectAction, {
            target: { value: actionsPredefinies[3].content },
          })
          fireEvent.change(commentaire, {
            target: { value: 'Commentaire action' },
          })
        })

        it("requiert la sélection d'une action", () => {
          // When
          fireEvent.change(selectAction, { target: { value: '' } })
          submit.click()

          // Then
          expect(submit).toHaveAttribute('disabled', '')
          expect(actionsService.createAction).not.toHaveBeenCalled()
        })

        describe('formulaire valide', () => {
          beforeEach(() => {
            // When
            submit.click()
          })

          it("crée l'action", () => {
            // Then
            expect(actionsService.createAction).toHaveBeenCalledWith(
              {
                intitule: actionsPredefinies[3].content,
                commentaire: 'Commentaire action',
              },
              '1',
              'id-jeune',
              'accessToken'
            )
          })

          it('redirige vers la fiche du jeune', () => {
            // Then
            expect(push).toHaveBeenCalledWith({
              pathname: `/mes-jeunes/id-jeune/actions`,
              query: { creation: 'succes' },
            })
          })
        })
      })
    })

    describe('dans l\'onglet "Action personnalisees"', () => {
      beforeEach(async () => {
        // Given
        const switchTab = screen.getByRole('tab', {
          name: 'Action personnalisée',
        })
        await act(async () => switchTab.click())
      })

      it("contient un champ pour saisir l'intitule de l'action", () => {
        // Then
        const intitule = screen.getByRole('textbox', {
          name: "* Intitulé de l'action",
        })
        expect(intitule).toHaveAttribute('required', '')
        expect(intitule).toHaveAttribute('type', 'text')
      })

      it('contient un champ pour saisir un commentaire', () => {
        // Then
        expect(
          screen.getByRole('textbox', { name: "Commentaire de l'action" })
        ).not.toHaveAttribute('required')
      })

      describe('action personnalisée remplie', () => {
        let intitule: HTMLInputElement
        let submit: HTMLButtonElement
        beforeEach(() => {
          // Given
          intitule = screen.getByRole('textbox', { name: /Intitulé/ })
          const commentaire = screen.getByRole('textbox', {
            name: /Commentaire/,
          })
          submit = screen.getByRole('button', { name: 'Envoyer' })

          fireEvent.change(intitule, { target: { value: 'Intitulé action' } })
          fireEvent.change(commentaire, {
            target: { value: 'Commentaire action' },
          })
        })

        it("requiert l'intitulé de l'action", () => {
          // When
          fireEvent.change(intitule, { target: { value: '' } })
          submit.click()

          // Then
          expect(submit).toHaveAttribute('disabled', '')
          expect(actionsService.createAction).not.toHaveBeenCalled()
        })

        describe('formulaire valide', () => {
          beforeEach(() => {
            // When
            submit.click()
          })

          it("crée l'action", () => {
            // Then
            expect(actionsService.createAction).toHaveBeenCalledWith(
              {
                intitule: 'Intitulé action',
                commentaire: 'Commentaire action',
              },
              '1',
              'id-jeune',
              'accessToken'
            )
          })

          it('redirige vers la fiche du jeune', () => {
            // Then
            expect(push).toHaveBeenCalledWith({
              pathname: `/mes-jeunes/id-jeune/actions`,
              query: { creation: 'succes' },
            })
          })
        })
      })
    })
  })
})
