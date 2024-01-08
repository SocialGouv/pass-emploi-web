import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'

import ModificationActionPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[jeune_id]/actions/[action_id]/modification/ModificationActionPage'
import { desActionsPredefinies, desSituationsNonProfessionnelles, uneAction } from 'fixtures/action'
import {
  ActionPredefinie,
  SituationNonProfessionnelle,
} from 'interfaces/action'
import { modifierAction } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/actions.service')
jest.mock('components/Modal')

describe('ModificationActionPage client side', () => {
  const action = uneAction()
  const actionsPredefinies: ActionPredefinie[] = desActionsPredefinies()
  const situationsNonProfessionnelles: SituationNonProfessionnelle[] = desSituationsNonProfessionnelles()

  beforeEach(async () => {
    // Given
    jest.spyOn(DateTime, 'now').mockReturnValue(DateTime.fromISO('2023-12-19'))

    // When
    renderWithContexts(
      <ModificationActionPage
        action={action}
        situationsNonProfessionnelles={situationsNonProfessionnelles}
        aDesCommentaires={false}
        idJeune='id-jeune'
        actionsPredefinies={actionsPredefinies}
        returnTo='/lien/retour'
      />
    )
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
    expect(screen.getByRole('radio', { name: 'À faire' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Terminée' })).not.toBeChecked()
  })

  it('contient un champ pour saisir une date d’échéance', () => {
    // Then
    expect(screen.getByLabelText('* Date')).toHaveAttribute('required')
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
      submit = screen.getByRole('button', { name: 'Enregistrer les modifications' })
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

        const description = screen.getByRole('textbox', { name: /Description/ })
        await userEvent.clear(description)
        await userEvent.type(description, 'Description action')

        await userEvent.click(screen.getByRole('button', { name: /Demain/ }))

        // When
        await userEvent.click(submit)
      })

      it("modifier l'action", () => {
        // Then
        expect(modifierAction).toHaveBeenCalledWith(
          'id-action-1',
          {
            codeCategorie: situationsNonProfessionnelles[2].code,
            titre: actionsPredefinies[1].titre,
            description: 'Description action',
            dateEcheance: '2023-12-20',
            statut: 'EnCours',
          }
        )
      })

      describe('succès', () => {
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
            screen.getByRole('link', { name: 'Consulter la liste des actions' })
          ).toHaveAttribute('href', '/mes-jeunes/id-jeune?onglet=actions')
        })
      })
    })
  })
})
