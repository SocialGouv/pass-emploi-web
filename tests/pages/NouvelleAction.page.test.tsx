import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import { ActionPredefinie } from 'interfaces/action'
import NouvelleAction, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions/nouvelle-action'
import { AlerteParam } from 'referentiel/alerteParam'
import { createAction } from 'services/actions.service'
import { getActionsPredefinies } from 'services/referentiel.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/referentiel.service')
jest.mock('services/actions.service')

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
        ;(getActionsPredefinies as jest.Mock).mockResolvedValue(
          actionsPredefinies
        )

        // When
        const actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getActionsPredefinies).toHaveBeenCalledWith('accessToken')
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
    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    let push: Function
    let actionsPredefinies: ActionPredefinie[]
    beforeEach(async () => {
      // Given
      alerteSetter = jest.fn()
      push = jest.fn(async () => {})
      ;(useRouter as jest.Mock).mockReturnValue({ push })
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
        {
          customAlerte: { alerteSetter },
        }
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
          name: /Action prédéfinie/,
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
          screen.getByRole('textbox', { name: /Commentaire/ })
        ).not.toHaveAttribute('required')
      })

      it('contient un champ pour saisir une date d’échéance', () => {
        // Then
        expect(screen.getByLabelText(/Date d’échéance/)).toHaveAttribute(
          'required'
        )
      })

      describe('action prédéfinie remplie', () => {
        let selectAction: HTMLSelectElement
        let submit: HTMLButtonElement

        beforeEach(async () => {
          // Given
          selectAction = screen.getByRole('combobox', {
            name: /Action prédéfinie/,
          })
          submit = screen.getByRole('button', { name: 'Créer l’action' })
        })

        it("requiert la sélection d'une action", async () => {
          const dateEcheance = screen.getByLabelText(/Date d’échéance/)

          await userEvent.type(dateEcheance, '2022-07-30')
          await userEvent.selectOptions(
            selectAction,
            actionsPredefinies[1].titre
          )
          // When
          fireEvent.change(selectAction, { target: { value: '' } })
          await userEvent.click(submit)

          // Then
          expect(createAction).not.toHaveBeenCalled()
        })

        it("affiche un message d'erreur quand le type d’action prédéfinie est vide", async () => {
          // When
          await userEvent.click(submit)

          // Then
          expect(
            screen.getByText(/Le champ “Action prédéfinie" est vide/)
          ).toBeInTheDocument()
          expect(createAction).not.toHaveBeenCalled()
        })

        it("affiche un message d'erreur quand la date d'échéance n'est pas au bon format", async () => {
          //Given
          await userEvent.selectOptions(
            selectAction,
            actionsPredefinies[1].titre
          )
          const dateEcheance = screen.getByLabelText(/Date d’échéance/)

          await userEvent.clear(dateEcheance)
          await userEvent.click(submit)

          // Then
          expect(
            screen.getByText(/Le champ “Date d’échéance” est vide/)
          ).toBeInTheDocument()
          expect(createAction).not.toHaveBeenCalled()
        })

        it("affiche un message d'erreur quand date d'echeance n'est pas dans l'interval: un an avant, deux ans après", async () => {
          const dateEcheance = screen.getByLabelText(/Date d’échéance/)
          await userEvent.type(dateEcheance, '2000-07-30')
          await userEvent.tab()

          const unAnAvant = DateTime.now().minus({ year: 1, day: 1 })
          const deuxAnsApres = DateTime.now().plus({ year: 2 })

          // Then
          expect(
            screen.getByText(
              `Le champ “Date d’échéance” est invalide. Le date attendue est comprise entre le ${unAnAvant.toFormat(
                'dd/MM/yyyy'
              )} et le ${deuxAnsApres.toFormat('dd/MM/yyyy')}.`
            )
          ).toBeInTheDocument()
        })

        describe('formulaire valide', () => {
          beforeEach(async () => {
            // Given
            await userEvent.selectOptions(
              selectAction,
              actionsPredefinies[1].titre
            )

            const description = screen.getByRole('textbox', {
              name: /Commentaire/,
            })
            await userEvent.type(description, 'Commentaire action')

            const dateEcheance = screen.getByLabelText(/Date d’échéance/)

            await userEvent.type(dateEcheance, '2022-07-30')

            const submit = screen.getByRole('button', {
              name: 'Créer l’action',
            })

            // When
            await userEvent.click(submit)
          })

          it("crée l'action", () => {
            // Then
            expect(createAction).toHaveBeenCalledWith(
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
            expect(alerteSetter).toHaveBeenCalledWith('creationAction')
            expect(push).toHaveBeenCalledWith(
              '/mes-jeunes/id-jeune?onglet=actions'
            )
          })
        })
      })
    })

    describe('dans l\'onglet "Action personnalisees"', () => {
      beforeEach(async () => {
        // Given
        const switchTab = screen.getByRole('tab', {
          name: /Action personnalisée/,
        })
        await userEvent.click(switchTab)
      })

      it("contient un champ pour saisir l'intitule de l'action", () => {
        // Then
        const intitule = screen.getByRole('textbox', {
          name: "Titre de l'action",
        })
        expect(intitule).toHaveAttribute('required', '')
        expect(intitule).toHaveAttribute('type', 'text')
      })

      it('contient un champ pour saisir une description', () => {
        // Then
        expect(
          screen.getByRole('textbox', { name: /Commentaire/ })
        ).not.toHaveAttribute('required')
      })

      it('contient un champ pour saisir une date d’échéance', () => {
        // Then
        expect(screen.getByLabelText(/Date d’échéance/)).toHaveAttribute(
          'required'
        )
      })

      describe('action personnalisée remplie', () => {
        let intitule: HTMLInputElement
        let submit: HTMLButtonElement
        beforeEach(async () => {
          // Given
          intitule = screen.getByRole('textbox', { name: /Titre/ })
          const description = screen.getByRole('textbox', {
            name: /Commentaire/,
          })
          const dateEcheance = screen.getByLabelText(/Date d’échéance/)

          submit = screen.getByRole('button', { name: 'Créer l’action' })

          await userEvent.type(intitule, 'Intitulé action')
          await userEvent.type(description, 'Commentaire action')
          await userEvent.type(dateEcheance, '2022-07-30')
        })

        describe('formulaire valide', () => {
          beforeEach(async () => {
            // When
            await userEvent.click(submit)
          })

          it("crée l'action", () => {
            // Then
            expect(createAction).toHaveBeenCalledWith(
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
            expect(alerteSetter).toHaveBeenCalledWith('creationAction')
            expect(push).toHaveBeenCalledWith(
              '/mes-jeunes/id-jeune?onglet=actions'
            )
          })
        })
      })
    })
  })
})
