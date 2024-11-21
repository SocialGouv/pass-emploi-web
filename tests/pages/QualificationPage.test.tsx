import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'

import QualificationPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/[idAction]/qualification/QualificationPage'
import { desCategoriesAvecNONSNP, uneAction } from 'fixtures/action'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import {
  Action,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import { AlerteParam } from 'referentiel/alerteParam'
import { qualifier } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/actions.service')

describe('QualificationPage client side', () => {
  let action: Action & { jeune: { id: string } }
  let categories: SituationNonProfessionnelle[]
  let container: HTMLElement

  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  beforeEach(() => {
    // Given
    action = {
      id: 'id-action-1',
      titre: 'Identifier ses atouts et ses compétences',
      comment: 'Je suis un beau commentaire',
      creationDate: '2022-02-15T15:50:46.000+01:00',
      lastUpdate: '2022-02-16T15:50:46.000+01:00',
      creator: 'Nils',
      creatorType: 'conseiller',
      status: StatutAction.AFaire,
      dateEcheance: '2022-02-20T14:50:46.000Z',
      dateFinReelle: '2022-09-02T11:00:00.000Z',
      jeune: {
        id: 'beneficiaire-1',
      },
    }
    categories = desCategoriesAvecNONSNP()

    alerteSetter = jest.fn()

    // When
    ;({ container } = renderWithContexts(
      <QualificationPage
        action={action}
        categories={categories}
        returnTo='/mes-jeunes/beneficiaire-1/actions/id-action-1'
        returnToListe='/pilotage'
      />,
      {
        customAlerte: { setter: alerteSetter },
      }
    ))
  })

  describe('quand il s’agit d’une action SNP', () => {
    beforeEach(async () => {
      // Given
      const selectSNP = screen.getByRole('combobox', { name: '* Catégorie' })
      await userEvent.selectOptions(selectSNP, categories[1].code)
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it("affiche les informations principales de l'action", () => {
      // Then
      const etape1 = screen.getByRole('group', {
        name: 'Étape 1: Informations principales',
      })
      const selectSNP = within(etape1).getByRole('combobox', {
        name: '* Catégorie',
      })

      categories.forEach(({ code, label }) => {
        expect(
          within(selectSNP).getByRole('option', { name: label })
        ).toHaveValue(code)
      })

      expect(
        within(etape1).getByRole('textbox', {
          name: /Titre et description de l'action/,
        })
      ).toHaveValue(action.titre + ' - ' + action.comment)
    })

    it("affiche la date de fin de l'action", () => {
      // Then
      const etape2 = screen.getByRole('group', {
        name: 'Étape 2: Date',
      })
      const inputDateFin = within(etape2).getByLabelText(
        '* Date de fin de l’action'
      )
      expect(inputDateFin).toHaveAttribute('type', 'date')
      expect(inputDateFin).toHaveValue('2022-09-02')
    })

    it('affiche un message d’information', async () => {
      // Then
      expect(
        screen.getByText(
          'Ces informations seront intégrées sur le dossier i-milo du bénéficiaire'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(/respecter les Conditions Générales d’utilisation/)
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'Voir le détail des CGU (nouvelle fenêtre)',
        })
      ).toHaveAttribute(
        'href',
        'https://c-milo.i-milo.fr/jcms/t482_1002488/fr/mentions-legales'
      )
      expect(
        screen.getByRole('link', {
          name: 'Voir le détail de l’arrêté du 17 novembre 2021 (nouvelle fenêtre)',
        })
      ).toHaveAttribute(
        'href',
        'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045084361'
      )
    })

    describe('formulaire', () => {
      let inputTitreEtDescription: HTMLElement
      let selectCategorie: HTMLElement

      beforeEach(async () => {
        // Given
        inputTitreEtDescription = screen.getByRole('textbox', {
          name: /Titre et description/,
        })
        selectCategorie = screen.getByRole('combobox', { name: '* Catégorie' })
        const inputDateFin = screen.getByLabelText('* Date de fin de l’action')

        await userEvent.clear(inputTitreEtDescription)
        await userEvent.type(
          inputTitreEtDescription,
          'Nouveau commentaire modifié'
        )
        await userEvent.selectOptions(selectCategorie, categories[1].code)
        fireEvent.change(inputDateFin, { target: { value: '2022-09-05' } })
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('affiche un message d’erreur si le commentaire est vide', async () => {
        // When
        await userEvent.clear(inputTitreEtDescription)
        await userEvent.tab()

        // Then
        expect(
          screen.getByText(
            'Le champ Titre et description n’est pas renseigné. Veuillez renseigner un titre ou une description.'
          )
        ).toBeInTheDocument()
      })

      it('affiche une erreur si le commentaire contient plus de 255 caractères', async () => {
        // When
        await userEvent.clear(inputTitreEtDescription)
        await userEvent.type(inputTitreEtDescription, 'a'.repeat(256))
        await userEvent.tab()

        // Then
        expect(
          screen.getByText(
            'Vous avez dépassé le nombre maximal de caractères. Veuillez retirer des caractères.'
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
          await userEvent.tab
          const titreEtDescription = screen.getByRole('textbox', {
            name: /Titre et description/,
          })

          await userEvent.clear(titreEtDescription)
          await userEvent.type(
            titreEtDescription,
            'Nouveau titre et commentaire de l’action'
          )
          const inputDateFin = screen.getByLabelText(
            '* Date de fin de l’action'
          )
          fireEvent.change(inputDateFin, { target: { value: '2022-09-05' } })

          // When
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Enregistrer et envoyer à i-milo',
            })
          )
        })

        it('a11y', async () => {
          let results: AxeResults

          await act(async () => {
            results = await axe(container)
          })

          expect(results!).toHaveNoViolations()
        })

        it('envoie la qualification au fuseau horaire du navigateur du client', async () => {
          // Then
          expect(qualifier).toHaveBeenCalledWith(action.id, 'SNP_3', {
            commentaire: 'Nouveau titre et commentaire de l’action',
            dateFinModifiee: DateTime.fromISO('2022-09-05T00:00:00.000+02:00'),
          })
        })

        it('affiche une page de succès', () => {
          // Then
          expect(
            screen.getByRole('heading', {
              level: 2,
              name: 'Action enregistrée !',
            })
          ).toBeInTheDocument()
          expect(
            screen.getByText(/Les informations sont en route vers i-milo/)
          ).toBeInTheDocument()
        })

        it("permet de retourner vers le détail de l'action", async () => {
          // Then
          expect(
            screen.getByRole('link', { name: 'Voir le détail' })
          ).toHaveAttribute(
            'href',
            '/mes-jeunes/beneficiaire-1/actions/id-action-1'
          )
        })

        it('permet de retourner vers la liste des actions', async () => {
          // Then
          expect(
            screen.getByRole('link', { name: 'Revenir à ma liste d‘actions' })
          ).toHaveAttribute('href', '/pilotage')
        })
      })
    })
  })

  describe('quand il s’agit d’une NON SNP', () => {
    beforeEach(async () => {
      // Given
      const selectSNP = screen.getByRole('combobox', { name: '* Catégorie' })

      // When
      await userEvent.selectOptions(selectSNP, categories[3].code)
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('affiche seulement les informations principales', () => {
      // Then
      expect(
        screen.getByRole('group', {
          name: 'Étape 1: Informations principales',
        })
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('group', {
          name: 'Étape 2: Date',
        })
      ).toThrow()
    })

    describe('formulaire', () => {
      let actionAQualifier: Action
      beforeEach(async () => {
        actionAQualifier = uneAction({
          status: StatutAction.Terminee,
        })
        // When
        const submit = screen.getByRole('button', {
          name: /Enregistrer/,
        })
        await userEvent.click(submit)
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it("qualifie l'action en NON SNP", () => {
        expect(qualifier).toHaveBeenCalledWith(
          actionAQualifier.id,
          CODE_QUALIFICATION_NON_SNP,
          {
            dateFinModifiee: DateTime.fromISO(action.dateEcheance),
          }
        )
      })

      it('affiche une page de succès', () => {
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Action enregistrée !',
          })
        ).toBeInTheDocument()
        expect(
          screen.getByText(/L’action est qualifiée en non-SNP./)
        ).toBeInTheDocument()
        expect(() =>
          screen.getByText(/Les informations sont en route vers i-milo/)
        ).toThrow()
      })
    })
  })
})
