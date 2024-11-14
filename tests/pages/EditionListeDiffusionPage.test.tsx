import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'

import EditionListeDiffusionPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/listes-de-diffusion/edition-liste/EditionListeDiffusionPage'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import { uneListeDeDiffusion } from 'fixtures/listes-de-diffusion'
import {
  BaseBeneficiaire,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { AlerteParam } from 'referentiel/alerteParam'
import {
  creerListeDeDiffusion,
  modifierListeDeDiffusion,
  supprimerListeDeDiffusion,
} from 'services/listes-de-diffusion.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/listes-de-diffusion.service')
jest.mock('components/ModalContainer')
jest.mock('components/PageActionsPortal')

describe('Page d’édition d’une liste de diffusion', () => {
  let beneficiaires: BaseBeneficiaire[]
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
    beforeEach(() => {
      ;({ container } = renderWithContexts(
        <EditionListeDiffusionPage returnTo='/mes-jeunes/listes-de-diffusion' />,
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

      expect(results).toHaveNoViolations()
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
      ).toHaveAttribute('aria-required', 'true')

      expect(
        screen.getByRole('button', { name: 'Créer la liste' })
      ).toBeInTheDocument()

      expect(screen.getByRole('link', { name: 'Annuler' })).toHaveAttribute(
        'href',
        '/mes-jeunes/listes-de-diffusion'
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

        expect(results).toHaveNoViolations()
      })

      it('ne soumet pas le formulaire quand aucun titre n’est renseigné', async () => {
        // When
        await userEvent.click(creationButton)

        // Then
        expect(creerListeDeDiffusion).not.toHaveBeenCalled()
        expect(
          screen.getByText(/Le champ “Titre” est vide./)
        ).toBeInTheDocument()
      })

      it('ne soumet pas le formulaire quand aucun bénéficiaire n’est renseigné', async () => {
        //Given
        await userEvent.type(titreInput, 'Liste métiers aéronautique')

        // When
        await userEvent.click(creationButton)

        // Then
        expect(creerListeDeDiffusion).not.toHaveBeenCalled()
        expect(
          screen.getByText(
            'Aucun bénéficiaire n’est renseigné. Sélectionnez au moins un bénéficiaire.'
          )
        ).toBeInTheDocument()
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

        expect(results).toHaveNoViolations()
      })

      describe('quand le formulaire est validé', () => {
        it('crée la liste', async () => {
          // Then
          expect(creerListeDeDiffusion).toHaveBeenCalledWith({
            titre: 'Liste métiers aéronautique',
            idsBeneficiaires: [beneficiaires[2].id, beneficiaires[0].id],
          })
        })

        it('redirige vers mes listes de diffusion', async () => {
          // Then
          expect(routerPush).toHaveBeenCalledWith(
            expect.stringMatching('/mes-jeunes/listes-de-diffusion')
          )
        })

        it('affiche un message de succès', async () => {
          // Then
          expect(alerteSetter).toHaveBeenCalledWith(
            AlerteParam.creationListeDiffusion
          )
        })
      })

      it('affiche un message d’erreur si la création échoue', async () => {
        // Given
        ;(creerListeDeDiffusion as jest.Mock).mockRejectedValue({})

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
    let listeDeDiffusion: ListeDeDiffusion
    beforeEach(() => {
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
      listeDeDiffusion = uneListeDeDiffusion({
        beneficiaires: [beneficiaire0, beneficiaire2],
      })
      ;({ container } = renderWithContexts(
        <EditionListeDiffusionPage
          returnTo='/mes-jeunes/listes-de-diffusion'
          liste={listeDeDiffusion}
        />,
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

      expect(results).toHaveNoViolations()
    })

    it('permet de supprimer la liste', async () => {
      // When
      await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
      await userEvent.click(
        screen.getByRole('button', { name: 'Supprimer la liste' })
      )

      // Then
      expect(supprimerListeDeDiffusion).toHaveBeenCalledWith(
        listeDeDiffusion.id
      )
      expect(alerteSetter).toHaveBeenCalledWith(
        AlerteParam.suppressionListeDiffusion
      )
      expect(routerPush).toHaveBeenCalledWith(
        expect.stringMatching('/mes-jeunes/listes-de-diffusion')
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
      expect(screen.getByLabelText(/Titre/)).toHaveValue(listeDeDiffusion.titre)
    })

    it('contient un lien pour annuler', async () => {
      // Then
      expect(screen.getByText('Annuler la modification')).toHaveAttribute(
        'href',
        '/mes-jeunes/listes-de-diffusion'
      )
    })

    it('ne permet pas de modifier tant qu’il n’y a pas de changement', async () => {
      //When
      await userEvent.click(
        screen.getByRole('button', { name: 'Modifier la liste' })
      )

      //Then
      expect(modifierListeDeDiffusion).not.toHaveBeenCalled()
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

        expect(results).toHaveNoViolations()
      })

      it('modifie la liste', async () => {
        // Then
        expect(modifierListeDeDiffusion).toHaveBeenCalledWith(
          listeDeDiffusion.id,
          {
            titre: 'Nouveau titre',
            idsBeneficiaires: [beneficiaires[1].id, beneficiaires[0].id],
          }
        )
      })

      it('affiche un message de succès', async () => {
        // Then
        expect(alerteSetter).toHaveBeenCalledWith(
          AlerteParam.modificationListeDiffusion
        )
      })

      it('redirige vers mes listes de diffusion', async () => {
        // Then
        expect(routerPush).toHaveBeenCalledWith(
          expect.stringMatching('/mes-jeunes/listes-de-diffusion')
        )
      })
    })
  })
})
