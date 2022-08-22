import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import { mockedActionsService } from 'fixtures/services'
import NouvelleAction, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions/nouvelle-action'
import { actionsPredefinies } from 'referentiel/action'
import { ActionsService } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

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
        expect(actual).toEqual({
          props: {
            idJeune: 'id-jeune',
            withoutChat: true,
            pageTitle: 'Actions jeune – Création action',
            pageHeader: 'Créer une nouvelle action',
            returnTo: '/mes-jeunes/id-jeune',
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
      renderWithContexts(
        <NouvelleAction idJeune='id-jeune' withoutChat={true} pageTitle='' />,
        { customDependances: { actionsService } }
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
          screen.getByRole('textbox', { name: /Description de l'action/ })
        ).not.toHaveAttribute('required')
      })

      it('contient un champ pour saisir une date d’échéance', () => {
        // Then
        expect(
          screen.getByLabelText(/Définir une date d’échéance/)
        ).toHaveAttribute('required')
      })

      describe('action prédéfinie remplie', () => {
        let selectAction: HTMLSelectElement
        let submit: HTMLButtonElement
        beforeEach(async () => {
          // Given
          selectAction = screen.getByRole('combobox', {
            name: /Choisir une action/,
          })
          const description = screen.getByRole('textbox', {
            name: /Description/,
          })

          const dateEcheance = screen.getByLabelText(/date d’échéance/)
          submit = screen.getByRole('button', { name: 'Envoyer' })

          await userEvent.selectOptions(
            selectAction,
            actionsPredefinies[3].content
          )
          await userEvent.type(description, 'Commentaire action')
          await userEvent.type(dateEcheance, '2022-07-30')
        })

        it("requiert la sélection d'une action", async () => {
          // When
          fireEvent.change(selectAction, { target: { value: '' } })
          await userEvent.click(submit)

          // Then
          expect(submit).toHaveAttribute('disabled', '')
          expect(actionsService.createAction).not.toHaveBeenCalled()
        })

        describe('formulaire valide', () => {
          beforeEach(async () => {
            // When
            await userEvent.click(submit)
          })

          it("crée l'action", () => {
            // Then
            expect(actionsService.createAction).toHaveBeenCalledWith(
              {
                intitule: actionsPredefinies[3].content,
                commentaire: 'Commentaire action',
                dateEcheance: '2022-07-30',
              },
              'id-jeune'
            )
          })

          it('redirige vers la fiche du jeune', () => {
            // Then
            expect(push).toHaveBeenCalledWith({
              pathname: `/mes-jeunes/id-jeune`,
              query: { creationAction: 'succes' },
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
        await userEvent.click(switchTab)
      })

      it("contient un champ pour saisir l'intitule de l'action", () => {
        // Then
        const intitule = screen.getByRole('textbox', {
          name: "* Intitulé de l'action",
        })
        expect(intitule).toHaveAttribute('required', '')
        expect(intitule).toHaveAttribute('type', 'text')
      })

      it('contient un champ pour saisir une description', () => {
        // Then
        expect(
          screen.getByRole('textbox', { name: /Description de l'action/ })
        ).not.toHaveAttribute('required')
      })

      it('contient un champ pour saisir une date d’échéance', () => {
        // Then
        expect(
          screen.getByLabelText(/Définir une date d’échéance/)
        ).toHaveAttribute('required')
      })

      describe('action personnalisée remplie', () => {
        let intitule: HTMLInputElement
        let submit: HTMLButtonElement
        beforeEach(async () => {
          // Given
          intitule = screen.getByRole('textbox', { name: /Intitulé/ })
          const description = screen.getByRole('textbox', {
            name: /Description/,
          })
          const dateEcheance = screen.getByLabelText(/date d’échéance/)

          submit = screen.getByRole('button', { name: 'Envoyer' })

          await userEvent.type(intitule, 'Intitulé action')
          await userEvent.type(description, 'Commentaire action')
          await userEvent.type(dateEcheance, '2022-07-30')
        })

        it("requiert l'intitulé de l'action", async () => {
          // When
          await userEvent.clear(intitule)
          await userEvent.click(submit)

          // Then
          expect(submit).toHaveAttribute('disabled', '')
          expect(actionsService.createAction).not.toHaveBeenCalled()
        })

        describe('formulaire valide', () => {
          beforeEach(async () => {
            // When
            await userEvent.click(submit)
          })

          it("crée l'action", () => {
            // Then
            expect(actionsService.createAction).toHaveBeenCalledWith(
              {
                intitule: 'Intitulé action',
                commentaire: 'Commentaire action',
                dateEcheance: '2022-07-30',
              },
              'id-jeune'
            )
          })

          it('redirige vers la fiche du jeune', () => {
            // Then
            expect(push).toHaveBeenCalledWith({
              pathname: `/mes-jeunes/id-jeune`,
              query: { creationAction: 'succes' },
            })
          })
        })
      })
    })
  })
})
