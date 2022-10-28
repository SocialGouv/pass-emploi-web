import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import {
  mockedActionsService,
  mockedReferentielService,
} from 'fixtures/services'
import { ActionPredefinie } from 'interfaces/action'
import NouvelleAction, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions/nouvelle-action'
import { ActionsService } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

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
          session: { accessToken: 'accessToken' },
        })

        const actionsPredefinies: { titre: string; id: string }[] = [
          {
            id: 'action-predefinie-1',
            titre: 'Identifier ses atouts et ses compétences',
          },
        ]
        const referentielService = mockedReferentielService({
          getActionsPredefinies: jest.fn(async () => actionsPredefinies),
        })
        ;(withDependance as jest.Mock).mockReturnValue(referentielService)

        // When
        const actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(referentielService.getActionsPredefinies).toHaveBeenCalledWith(
          'accessToken'
        )
        expect(actual).toEqual({
          props: {
            idJeune: 'id-jeune',
            actionsPredefinies,
            withoutChat: true,
            pageTitle: 'Actions jeune – Créer action',
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
    let actionsPredefinies: ActionPredefinie[]
    beforeEach(async () => {
      // Given
      push = jest.fn(async () => {})
      ;(useRouter as jest.Mock).mockReturnValue({ push })
      actionsService = mockedActionsService()
      actionsPredefinies = [
        {
          id: 'action-predefinie-1',
          titre: 'Identifier ses atouts et ses compétences',
        },
        { id: 'action-predefinie-2', titre: 'Identifier des pistes de métier' },
        { id: 'action-predefinie-3', titre: 'Identifier des entreprises' },
      ]

      // When
      renderWithContexts(
        <NouvelleAction
          idJeune='id-jeune'
          actionsPredefinies={actionsPredefinies}
          withoutChat={true}
          pageTitle=''
        />,
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
          name: 'Choisir une action prédéfinie',
        })

        expect(select).toHaveAttribute('required', '')
        actionsPredefinies.forEach(({ titre }) => {
          expect(
            within(select).getByRole('option', { name: titre })
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
            actionsPredefinies[1].titre
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
                intitule: actionsPredefinies[1].titre,
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
          name: "Intitulé de l'action",
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
