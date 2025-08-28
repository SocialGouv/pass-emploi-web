import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'

import EditionListePage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/listes/edition-liste/EditionListePage'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import { uneListe } from 'fixtures/listes'
import {
  getNomBeneficiaireComplet,
  IdentiteBeneficiaire,
} from 'interfaces/beneficiaire'
import { Liste } from 'interfaces/liste'
import { AlerteParam } from 'referentiel/alerteParam'
import {
  creerListe,
  modifierListe,
  supprimerListe,
} from 'services/listes.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/listes.service')
jest.mock('components/ModalContainer')
jest.mock('components/PageActionsPortal')

describe('Page d’édition d’une liste ', () => {
  let beneficiaires: IdentiteBeneficiaire[]
  let container: HTMLElement

  let alerteSetter: (alert: AlerteParam | undefined) => void
  let routerPush: jest.Mock

  beforeEach(async () => {
    // Given - When
    alerteSetter = jest.fn()
    routerPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })

    beneficiaires = desItemsBeneficiaires()
  })

  describe('contenu', () => {
    beforeEach(async () => {
      ;({ container } = await renderWithContexts(
        <EditionListePage returnTo='/mes-jeunes/listes' />,
        {
          customAlerte: { setter: alerteSetter },
        }
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('affiche le formulaire', () => {
      // Then
      expect(
        screen.getByRole('textbox', {
          name: /Titre Exemple : Ma liste de pâtissier/,
        })
      ).toHaveProperty('required', true)
      expect(
        screen.getByRole('combobox', {
          name: /Recherchez et ajoutez un ou plusieurs bénéficiaires/,
        })
      ).toHaveAttribute('aria-required', 'false')

      expect(
        screen.getByRole('button', { name: 'Créer la liste' })
      ).toBeInTheDocument()

      expect(screen.getByRole('link', { name: 'Annuler' })).toHaveAttribute(
        'href',
        '/mes-jeunes/listes'
      )
    })

    describe('formulaire incomplet', () => {
      let titreInput: HTMLInputElement
      let creationButton: HTMLButtonElement

      beforeEach(async () => {
        titreInput = screen.getByLabelText(/\* Titre/)
        creationButton = screen.getByRole('button', {
          name: 'Créer la liste',
        })
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('ne soumet pas le formulaire quand aucun titre n’est renseigné', async () => {
        // When
        await userEvent.click(creationButton)

        // Then
        expect(creerListe).not.toHaveBeenCalled()
        expect(
          screen.getByText(/Le champ “Titre” est vide./)
        ).toBeInTheDocument()
      })

      it('soumet le formulaire quand aucun bénéficiaire n’est renseigné', async () => {
        //Given
        await userEvent.type(titreInput, 'Liste métiers aéronautique')

        // When
        await userEvent.click(creationButton)

        // Then
        expect(creerListe).toHaveBeenCalled()
      })
    })

    describe('formulaire rempli', () => {
      beforeEach(async () => {
        const titreInput = screen.getByLabelText(/\* Titre/)
        const destinatairesSelect = screen.getByLabelText(
          /Recherchez et ajoutez un ou plusieurs bénéficiaires/
        )
        const creationButton = screen.getByRole('button', {
          name: 'Créer la liste',
        })

        // Given
        await userEvent.type(titreInput, 'Liste métiers aéronautique')
        await userEvent.type(
          destinatairesSelect,
          getNomBeneficiaireComplet(beneficiaires[0])
        )
        await userEvent.type(
          destinatairesSelect,
          getNomBeneficiaireComplet(beneficiaires[2])
        )

        // When
        await userEvent.click(creationButton)
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      describe('quand le formulaire est validé', () => {
        it('crée la liste', async () => {
          // Then
          expect(creerListe).toHaveBeenCalledWith({
            titre: 'Liste métiers aéronautique',
            idsBeneficiaires: [beneficiaires[2].id, beneficiaires[0].id],
          })
        })

        it('redirige vers mes listes', async () => {
          // Then
          expect(routerPush).toHaveBeenCalledWith(
            expect.stringMatching('/mes-jeunes/listes')
          )
        })

        it('affiche un message de succès', async () => {
          // Then
          expect(alerteSetter).toHaveBeenCalledWith(AlerteParam.creationListe)
        })
      })

      it('affiche un message d’erreur si la création échoue', async () => {
        // Given
        ;(creerListe as jest.Mock).mockRejectedValue({})

        // When
        await userEvent.click(screen.getByText('Créer la liste'))

        // Then
        expect(
          screen.getByText(
            'Une erreur s’est produite, veuillez réessayer ultérieurement.'
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('modification', () => {
    let liste: Liste
    beforeEach(async () => {
      // When
      const beneficiaire0 = {
        id: beneficiaires[0].id,
        prenom: beneficiaires[0].prenom,
        nom: beneficiaires[0].nom,
        estDansLePortefeuille: true,
      }
      const beneficiaire2 = {
        id: 'id-2',
        prenom: 'Jacques',
        nom: 'Chirac',
        estDansLePortefeuille: false,
      }
      liste = uneListe({
        beneficiaires: [beneficiaire0, beneficiaire2],
      })
      ;({ container } = await renderWithContexts(
        <EditionListePage returnTo='/mes-jeunes/listes' liste={liste} />,
        {
          customAlerte: { setter: alerteSetter },
        }
      ))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('permet de supprimer la liste', async () => {
      // When
      await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
      await userEvent.click(
        screen.getByRole('button', { name: 'Supprimer la liste' })
      )

      // Then
      expect(supprimerListe).toHaveBeenCalledWith(liste.id)
      expect(alerteSetter).toHaveBeenCalledWith(AlerteParam.suppressionListe)
      expect(routerPush).toHaveBeenCalledWith(
        expect.stringMatching('/mes-jeunes/listes')
      )
    })

    it('charge les bénéficiaires de la liste', () => {
      // Then
      const beneficiaire0Fullname = getNomBeneficiaireComplet(beneficiaires[0])
      const beneficiaire2Fullname = 'Chirac Jacques'
      expect(() =>
        screen.getByRole('option', {
          name: beneficiaire0Fullname,
          hidden: true,
        })
      ).toThrow()
      expect(() =>
        screen.getByRole('option', {
          name: beneficiaire2Fullname,
          hidden: true,
        })
      ).toThrow()

      const destinataires = screen.getByRole('list', {
        name: /Bénéficiaires/,
      })
      expect(
        within(destinataires).getByText(beneficiaire0Fullname)
      ).toBeInTheDocument()
      expect(
        within(destinataires).getByText(beneficiaire2Fullname)
      ).toBeInTheDocument()
      expect(
        within(destinataires).getByText(
          'Ce bénéficiaire a été réaffecté temporairement à un autre conseiller'
        )
      ).toBeInTheDocument()
    })

    it('charge le titre de la liste', () => {
      // When
      expect(screen.getByLabelText(/Titre/)).toHaveValue(liste.titre)
    })

    it('contient un lien pour annuler', async () => {
      // Then
      expect(screen.getByText('Annuler la modification')).toHaveAttribute(
        'href',
        '/mes-jeunes/listes'
      )
    })

    it('ne permet pas de modifier tant qu’il n’y a pas de changement', async () => {
      //When
      await userEvent.click(
        screen.getByRole('button', { name: 'Modifier la liste' })
      )

      //Then
      expect(modifierListe).not.toHaveBeenCalled()
    })

    describe('liste modifiée', () => {
      beforeEach(async () => {
        // Given
        const inputTitre = screen.getByLabelText(/Titre/)
        await userEvent.clear(inputTitre)
        await userEvent.type(inputTitre, 'Nouveau titre')

        await userEvent.click(
          screen.getByText(/Enlever beneficiaire Chirac Jacques/)
        )
        await userEvent.type(
          screen.getByLabelText(
            /Recherchez et ajoutez un ou plusieurs bénéficiaires/
          ),
          getNomBeneficiaireComplet(beneficiaires[1])
        )

        // When
        await userEvent.click(
          screen.getByRole('button', { name: 'Modifier la liste' })
        )
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('modifie la liste', async () => {
        // Then
        expect(modifierListe).toHaveBeenCalledWith(liste.id, {
          titre: 'Nouveau titre',
          idsBeneficiaires: [beneficiaires[1].id, beneficiaires[0].id],
        })
      })

      it('affiche un message de succès', async () => {
        // Then
        expect(alerteSetter).toHaveBeenCalledWith(AlerteParam.modificationListe)
      })

      it('redirige vers mes listes', async () => {
        // Then
        expect(routerPush).toHaveBeenCalledWith(
          expect.stringMatching('/mes-jeunes/listes')
        )
      })
    })
  })
})
