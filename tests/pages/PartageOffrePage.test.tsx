import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'

import PartageOffrePage from 'app/(connected)/(with-sidebar)/(without-chat)/offres/[typeOffre]/[idOffre]/partage/PartageOffrePage'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import {
  unDetailImmersion,
  unDetailOffreEmploi,
  unDetailServiceCivique,
} from 'fixtures/offre'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import {
  DetailImmersion,
  DetailOffre,
  DetailOffreEmploi,
  DetailServiceCivique,
  TypeOffre,
} from 'interfaces/offre'
import { AlerteParam } from 'referentiel/alerteParam'
import { partagerOffre } from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/messages.service')

describe('PartageOffrePage client side', () => {
  let container: HTMLElement
  describe('commun', () => {
    let offre: DetailOffre
    let jeunes: BaseBeneficiaire[]

    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    let push: Function
    beforeEach(() => {
      alerteSetter = jest.fn()
      push = jest.fn(async () => {})
      ;(useRouter as jest.Mock).mockReturnValue({ push })

      offre = unDetailOffreEmploi()
      jeunes = desItemsBeneficiaires()
      ;(partagerOffre as jest.Mock).mockResolvedValue({})
      ;({ container } = renderWithContexts(
        <PartageOffrePage offre={offre} returnTo='/return/to' />,
        {
          customAlerte: { alerteSetter },
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

    it('contient une liste pour choisir un ou plusieurs jeune', () => {
      // Given
      const etape = screen.getByRole('group', {
        name: 'Étape 1: Bénéficiaires',
      })

      // Then
      const selectJeune = within(etape).getByRole('combobox', {
        name: /Bénéficiaires/,
      })
      const options = within(etape).getByRole('listbox', { hidden: true })

      expect(selectJeune).toHaveAttribute('aria-required', 'true')
      expect(selectJeune).toHaveAttribute('multiple', '')
      for (const jeune of jeunes) {
        const jeuneOption = within(options).getByRole('option', {
          name: `${jeune.nom} ${jeune.prenom}`,
          hidden: true,
        })
        expect(jeuneOption).toBeInTheDocument()
      }
    })

    it('contient un champ de saisie pour accompagner l’offre d’un message', () => {
      // Given
      const etape = screen.getByRole('group', {
        name: 'Étape 2: Écrivez votre message',
      })

      // Then
      expect(
        within(etape).getByRole('textbox', { name: /Message/ })
      ).toBeInTheDocument()
    })

    it('contient un bouton d’envoi et d’annulation', () => {
      // Then
      expect(screen.getByRole('button', { name: 'Envoyer' })).toHaveAttribute(
        'type',
        'submit'
      )
      expect(screen.getByRole('link', { name: 'Annuler' })).toHaveAttribute(
        'href',
        '/return/to'
      )
    })

    describe('formulaire incomplet', () => {
      beforeEach(async () => {
        //Given
        let buttonValider: HTMLButtonElement = screen.getByRole('button', {
          name: 'Envoyer',
        })

        //When
        await userEvent.click(buttonValider)
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results).toHaveNoViolations()
      })

      it('ne valide pas le formulaire si aucun bénéficiaire n’est sélectionné', async () => {
        //Then
        expect(partagerOffre).not.toHaveBeenCalled()
        expect(
          screen.getByText(/Le champ ”Destinataires” est vide./)
        ).toBeInTheDocument()
      })
    })

    describe('formulaire rempli', () => {
      let inputMessage: HTMLTextAreaElement
      let buttonValider: HTMLButtonElement
      let message: string
      beforeEach(async () => {
        // Given

        const selectJeune = screen.getByRole('combobox', {
          name: /Bénéficiaires/,
        })
        inputMessage = screen.getByRole('textbox', { name: /Message/ })
        buttonValider = screen.getByRole('button', { name: 'Envoyer' })

        message = "Regarde cette offre qui pourrait t'intéresser."
        await userEvent.type(selectJeune, 'Jirac Kenji')
        await userEvent.type(selectJeune, "D'Aböville-Muñoz François Maria")
        await userEvent.type(inputMessage, message)
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results).toHaveNoViolations()
      })

      it("partage l'offre", async () => {
        // When
        await userEvent.click(buttonValider)

        // Then
        expect(partagerOffre).toHaveBeenCalledWith({
          offre,
          idsDestinataires: [jeunes[2].id, jeunes[0].id],
          cleChiffrement: 'cleChiffrement',
          message,
        })
      })

      it('partage une offre avec un message par défaut', async () => {
        // Given
        await userEvent.clear(inputMessage)

        // When
        await userEvent.click(buttonValider)

        // Then
        expect(partagerOffre).toHaveBeenCalledWith({
          offre,
          idsDestinataires: [jeunes[2].id, jeunes[0].id],
          cleChiffrement: 'cleChiffrement',
          message:
            'Bonjour, je vous partage une offre d’emploi qui pourrait vous intéresser.',
        })
      })

      it('renvoie à la recherche', async () => {
        // When
        await userEvent.click(buttonValider)

        // Then
        expect(alerteSetter).toHaveBeenCalledWith('partageOffre')
        expect(push).toHaveBeenCalledWith('/return/to')
      })
    })
  })

  describe('spécifique', () => {
    describe("affiche les informations de l’offre d'emploi", () => {
      let offre: DetailOffreEmploi
      beforeEach(() => {
        // Given
        offre = unDetailOffreEmploi()
        ;({ container } = renderWithContexts(
          <PartageOffrePage offre={offre} returnTo='/return/to' />
        ))
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results).toHaveNoViolations()
      })

      it('contenu', () => {
        // Then
        const offreCard = screen.getByRole('heading', {
          name: 'Offre n°' + offre.id,
        }).parentElement!
        expect(within(offreCard).getByText('Emploi')).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.titre)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.typeContrat)
        ).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.duree!)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.nomEntreprise!)
        ).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.localisation!)
        ).toBeInTheDocument()
      })
    })

    describe("affiche les informations de l’offre d'alternance", () => {
      let offre: DetailOffreEmploi

      beforeEach(() => {
        // Given
        offre = unDetailOffreEmploi({ type: TypeOffre.ALTERNANCE })
        ;({ container } = renderWithContexts(
          <PartageOffrePage offre={offre} returnTo='/return/to' />
        ))
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results).toHaveNoViolations()
      })

      it('contenu', () => {
        // Then
        const offreCard = screen.getByRole('heading', {
          name: 'Offre n°' + offre.id,
        }).parentElement!
        expect(within(offreCard).getByText('Alternance')).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.titre)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.typeContrat)
        ).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.duree!)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.nomEntreprise!)
        ).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.localisation!)
        ).toBeInTheDocument()
      })
    })

    describe('affiche les informations du service civique', () => {
      let offre: DetailServiceCivique

      beforeEach(() => {
        // Given
        offre = unDetailServiceCivique()
        ;({ container } = renderWithContexts(
          <PartageOffrePage offre={offre} returnTo='/return/to' />
        ))
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results).toHaveNoViolations()
      })

      it('contenu', () => {
        // Then
        const offreCard = screen.getByRole('heading', {
          name: offre.titre,
        }).parentElement!
        expect(within(offreCard).getByText(offre.domaine)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.organisation!)
        ).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.ville!)).toBeInTheDocument()
        expect(
          within(offreCard).getByText('Dès le 17 février 2022')
        ).toBeInTheDocument()
      })
    })

    describe("affiche les informations de l'immersion", () => {
      let offre: DetailImmersion

      beforeEach(() => {
        // Given
        offre = unDetailImmersion()
        ;({ container } = renderWithContexts(
          <PartageOffrePage offre={offre} returnTo='/return/to' />
        ))
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results).toHaveNoViolations()
      })

      it('contenu', () => {
        // Then
        const offreCard = screen.getByRole('heading', {
          name: offre.titre,
        }).parentElement!
        expect(
          within(offreCard).getByText(offre.nomEtablissement)
        ).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.ville)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.secteurActivite)
        ).toBeInTheDocument()
      })
    })
  })
})
