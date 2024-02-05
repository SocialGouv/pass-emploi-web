import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'

import NouvelleActionPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/nouvelle-action/NouvelleActionPage'
import { desActionsPredefinies, desCategories } from 'fixtures/action'
import {
  ActionPredefinie,
  SituationNonProfessionnelle,
} from 'interfaces/action'
import { creerAction } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/actions.service')
jest.mock('components/Modal')

describe('NouvelleActionPage client side', () => {
  const categories: SituationNonProfessionnelle[] = desCategories()
  const actionsPredefinies: ActionPredefinie[] = desActionsPredefinies()

  beforeEach(async () => {
    // Given
    jest.spyOn(DateTime, 'now').mockReturnValue(DateTime.fromISO('2023-12-19'))

    // When
    renderWithContexts(
      <NouvelleActionPage
        idJeune='id-jeune'
        categories={categories}
        actionsPredefinies={actionsPredefinies}
        returnTo='/lien/retour'
      />
    )
  })

  it("permet d'annuler la création de l'action", () => {
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

    categories.forEach(({ label }) => {
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
      screen.getByRole('heading', { name: 'Pourquoi choisir une catégorie ?' })
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
    expect(screen.getByRole('radio', { name: 'À faire' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Terminée' })).toBeChecked()
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

  describe('action remplie', () => {
    let submit: HTMLButtonElement

    beforeEach(async () => {
      // Given
      submit = screen.getByRole('button', { name: 'Créer l’action' })
    })

    it("affiche un message d'erreur quand la catégorie est vide", async () => {
      // When
      await userEvent.click(submit)

      // Then
      expect(
        screen.getByText(/Le champ “Catégorie" est vide/)
      ).toBeInTheDocument()
      expect(creerAction).not.toHaveBeenCalled()
    })

    it("affiche un message d'erreur quand le titre est vide", async () => {
      // When
      await userEvent.click(submit)

      // Then
      expect(
        screen.getByText(/Le champ “Titre de l’action" est vide/)
      ).toBeInTheDocument()
      expect(creerAction).not.toHaveBeenCalled()
    })

    it("affiche un message d'erreur quand le titre est autre et le titre personnalisé est vide", async () => {
      // When
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /Titre/ }),
        'Autre'
      )
      await userEvent.click(submit)

      // Then
      expect(
        screen.getByText(/Le champ "Titre personnalisé" est vide/)
      ).toBeInTheDocument()
      expect(creerAction).not.toHaveBeenCalled()
    })

    it("affiche un message d'erreur quand la date d'échéance est vide", async () => {
      //Given
      await userEvent.click(submit)

      // Then
      expect(
        screen.getByText(/Le champ “Date de l’action” est vide/)
      ).toBeInTheDocument()
      expect(creerAction).not.toHaveBeenCalled()
    })

    it("affiche un message d'erreur quand date d'échéance n'est pas dans l'intervalle : un an avant, deux ans après", async () => {
      const dateEcheance = screen.getByLabelText(/Date/)
      await userEvent.type(dateEcheance, '2000-07-30')
      await userEvent.tab()

      // Then
      expect(
        screen.getByText(
          `Le champ “Date de l’action” est invalide. Le date attendue est comprise entre le 18/12/2022 et le 19/12/2025.`
        )
      ).toBeInTheDocument()
    })

    describe('formulaire valide', () => {
      beforeEach(async () => {
        // Given
        await userEvent.selectOptions(
          screen.getByRole('combobox', { name: /Catégorie/ }),
          categories[2].label
        )
        await userEvent.selectOptions(
          screen.getByRole('combobox', { name: /Titre/ }),
          actionsPredefinies[1].titre
        )

        const description = screen.getByRole('textbox', { name: /Description/ })
        await userEvent.type(description, 'Description action')

        await userEvent.click(screen.getByRole('button', { name: /Demain/ }))

        // When
        await userEvent.click(submit)
      })

      it("crée l'action", () => {
        // Then
        expect(creerAction).toHaveBeenCalledWith(
          {
            codeCategorie: categories[2].code,
            titre: actionsPredefinies[1].titre,
            description: 'Description action',
            dateEcheance: '2023-12-20',
            statut: 'Terminee',
          },
          'id-jeune'
        )
      })

      describe('succès', () => {
        it('affiche message de succès', () => {
          // Then
          expect(
            screen.getByRole('heading', {
              level: 2,
              name: 'Action enregistrée !',
            })
          ).toBeInTheDocument()
        })

        it('permet de retourner à la liste des actions', async () => {
          // Then
          expect(
            screen.getByRole('link', { name: 'Consulter la liste des actions' })
          ).toHaveAttribute('href', '/lien/retour')
        })

        it('permet de créer une nouvelle action', async () => {
          // When
          await userEvent.click(
            screen.getByRole('button', { name: 'Créer une nouvelle action' })
          )

          // Then
          expect(
            screen.queryByText(/Action enregistrée/)
          ).not.toBeInTheDocument()
          expect(
            screen.getByRole('button', { name: 'Créer l’action' })
          ).toBeInTheDocument()
        })
      })
    })
  })
})
