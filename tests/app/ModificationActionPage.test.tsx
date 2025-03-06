import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'

import ModificationActionPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/[idAction]/modification/ModificationActionPage'
import {
  desActionsPredefinies,
  desCategories,
  uneAction,
} from 'fixtures/action'
import { StatutAction } from 'interfaces/action'
import { creerAction, modifierAction } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/actions.service')
jest.mock('components/ModalContainer')

describe('ModificationActionPage client side', () => {
  let container: HTMLElement

  const actionsPredefinies = desActionsPredefinies()
  const situationsNonProfessionnelles = desCategories()

  beforeEach(() => {
    // Given
    jest.spyOn(DateTime, 'now').mockReturnValue(DateTime.fromISO('2023-12-19'))
  })

  describe('Action en cours', () => {
    const action = uneAction()
    beforeEach(async () => {
      // When
      ;({ container } = await renderWithContexts(
        <ModificationActionPage
          action={action}
          situationsNonProfessionnelles={situationsNonProfessionnelles}
          actionsPredefinies={actionsPredefinies}
          returnTo='/lien/retour'
        />
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it("permet d'annuler la modification de l'action", () => {
      // Then
      expect(
        screen.getByRole('link', {
          hidden: true,
          name: 'Annuler',
        })
      ).toHaveAttribute('href', '/lien/retour')
    })

    it('contient une liste des catégories de qualification', async () => {
      // Then
      const select = screen.getByRole('combobox', { name: /Catégorie/ })

      situationsNonProfessionnelles.forEach(({ label }) => {
        expect(
          within(select).getByRole('option', { name: label })
        ).toBeInTheDocument()
      })

      await userEvent.click(
        screen.getByRole('button', {
          name: 'À quoi servent les catégories ?',
        })
      )
      expect(
        screen.getByRole('heading', {
          name: 'Pourquoi choisir une catégorie ?',
        })
      ).toBeInTheDocument()
    })

    it('contient une liste de titres prédéfinis', () => {
      // Then
      const select = screen.getByRole('combobox', { name: /Titre de l’action/ })

      expect(select).toHaveAttribute('required', '')
      actionsPredefinies.forEach(({ titre }) => {
        expect(
          within(select).getByRole('option', { name: titre })
        ).toBeInTheDocument()
      })
    })

    it('contient un champ pour saisir un titre personnalisé', async () => {
      // Given
      expect(
        screen.queryByRole('textbox', { name: /titre personnalisé/ })
      ).not.toBeInTheDocument()

      // When
      const select = screen.getByRole('combobox', { name: /Titre de l’action/ })
      await userEvent.selectOptions(select, 'Autre')

      //The
      expect(
        screen.getByRole('textbox', { name: /titre personnalisé/ })
      ).toHaveAttribute('required')
    })

    it('contient un champ pour saisir un commentaire', () => {
      // Then
      expect(
        screen.getByRole('textbox', { name: /Description/ })
      ).not.toHaveAttribute('required')
    })

    it('contient des boutons pour choisir le statut de l‘action', async () => {
      // Then
      expect(screen.getByRole('radio', { name: 'À faire' })).toBeChecked()
      expect(screen.getByRole('radio', { name: 'Terminée' })).not.toBeChecked()
    })

    it('contient un champ pour saisir une date d’échéance', () => {
      // Then
      expect(screen.getByLabelText('* Date de l’action')).toHaveAttribute(
        'required'
      )
    })

    it('contient des boutons pour faciliter le choix de la date d’échéance', async () => {
      expect(
        screen.getByRole('button', { name: "Aujourd'hui (mardi 19)" })
      ).toHaveAttribute('aria-controls', 'date-action')
      expect(
        screen.getByRole('button', { name: 'Demain (mercredi 20)' })
      ).toHaveAttribute('aria-controls', 'date-action')
      expect(
        screen.getByRole('button', { name: 'Semaine prochaine (lundi 25)' })
      ).toHaveAttribute('aria-controls', 'date-action')
    })

    it('contient un champ pour saisir une date de fin si on change le statut de l’action', async () => {
      // When
      await userEvent.click(screen.getByRole('radio', { name: 'Terminée' }))

      // Then
      expect(
        screen.queryByLabelText('* Date de l’action')
      ).not.toBeInTheDocument()
      expect(screen.getByLabelText('* Date de réalisation')).toHaveAttribute(
        'required'
      )
    })

    describe('action remplie', () => {
      let submit: HTMLButtonElement

      beforeEach(async () => {
        // Given
        submit = screen.getByRole('button', {
          name: 'Enregistrer les modifications',
        })
      })

      describe('formulaire valide', () => {
        beforeEach(async () => {
          // Given
          await userEvent.selectOptions(
            screen.getByRole('combobox', { name: /Catégorie/ }),
            situationsNonProfessionnelles[2].label
          )
          await userEvent.selectOptions(
            screen.getByRole('combobox', { name: /Titre/ }),
            actionsPredefinies[1].titre
          )

          const description = screen.getByRole('textbox', {
            name: /Description/,
          })
          await userEvent.clear(description)
          await userEvent.type(description, 'Description action')

          await userEvent.click(screen.getByRole('button', { name: /Demain/ }))

          // When
          await userEvent.click(submit)
        })

        it('a11y', async () => {
          let results: AxeResults

          await act(async () => {
            results = await axe(container)
          })

          expect(results!).toHaveNoViolations()
        })

        it("modifier l'action", () => {
          // Then
          expect(modifierAction).toHaveBeenCalledWith('id-action-1', {
            codeCategorie: situationsNonProfessionnelles[2].code,
            titre: actionsPredefinies[1].titre,
            description: 'Description action',
            dateEcheance: '2023-12-20',
            statut: 'AFaire',
          })
        })

        describe('succès', () => {
          it('a11y', async () => {
            let results: AxeResults

            await act(async () => {
              results = await axe(container)
            })

            expect(results!).toHaveNoViolations()
          })

          it('affiche message de succès', () => {
            // Then
            expect(
              screen.getByRole('heading', {
                level: 2,
                name: 'Modifications enregistrées',
              })
            ).toBeInTheDocument()
          })

          it('permet de retourner à la liste des actions', async () => {
            // Then
            expect(
              screen.getByRole('link', {
                name: 'Consulter la liste des actions',
              })
            ).toHaveAttribute(
              'href',
              '/mes-jeunes/beneficiaire-1?onglet=actions'
            )
          })
        })
      })
    })
  })

  describe('Action terminée', () => {
    const action = uneAction({
      status: StatutAction.Terminee,
      dateFinReelle: '2022-12-21T14:50:46.000Z',
    })
    beforeEach(async () => {
      // When
      ;({ container } = await renderWithContexts(
        <ModificationActionPage
          action={action}
          situationsNonProfessionnelles={situationsNonProfessionnelles}
          actionsPredefinies={actionsPredefinies}
          returnTo='/lien/retour'
        />
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('contient un champ pour saisir une date de fin', () => {
      // Then
      expect(screen.getByLabelText('* Date de réalisation')).toHaveAttribute(
        'required'
      )
    })

    describe('contient un champ pour saisir une date d’échéance si on change le statut de l’action', () => {
      beforeEach(async () => {
        // When
        await userEvent.click(screen.getByRole('radio', { name: 'À faire' }))
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('contenu', () => {
        // Then
        expect(
          screen.queryByLabelText('* Date de réalisation')
        ).not.toBeInTheDocument()
        expect(screen.getByLabelText('* Date de l’action')).toHaveAttribute(
          'required'
        )
      })
    })

    describe("affiche un message d'erreur quand la date d'échéance est vide", () => {
      beforeEach(async () => {
        // Given
        const submit = screen.getByRole('button', { name: /Enregistrer/ })

        // When
        await userEvent.clear(screen.getByLabelText('* Date de réalisation'))
        await userEvent.click(submit)
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('contenu', () => {
        // Then
        expect(
          screen.getByText(/Le champ “Date de réalisation” est vide/)
        ).toBeInTheDocument()
        expect(creerAction).not.toHaveBeenCalled()
      })
    })

    describe("affiche un message d'erreur quand date d'échéance n'est pas dans l'intervalle : un an avant, deux ans après", () => {
      beforeEach(async () => {
        const dateRealisation = screen.getByLabelText(/Date/)
        await userEvent.clear(dateRealisation)
        await userEvent.type(dateRealisation, '2000-07-30')
        await userEvent.tab()
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('contenu', () => {
        // Then
        expect(
          screen.getByText(
            `Le champ “Date de réalisation” est invalide. Le date attendue est comprise entre le 18/12/2022 et le 19/12/2025.`
          )
        ).toBeInTheDocument()
      })
    })
  })
})
