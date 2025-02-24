import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'

import HomePage from 'app/(connected)/(with-sidebar)/(with-chat)/(index)/HomePage'
import { uneListeDAgencesFranceTravail } from 'fixtures/referentiel'
import { Agence } from 'interfaces/referentiel'
import { structureFTCej, structureMilo } from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import { modifierAgence } from 'services/conseiller.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/conseiller.service')
jest.mock('components/ModalContainer')

describe('HomePage client side', () => {
  let container: HTMLElement
  let replace: jest.Mock
  beforeEach(() => {
    // Given
    replace = jest.fn(() => Promise.resolve())
    ;(useRouter as jest.Mock).mockReturnValue({ replace })
  })

  describe('quand le conseiller doit renseigner sa structure', () => {
    beforeEach(async () => {
      // When
      ;({ container } = await renderWithContexts(
        <HomePage
          afficherModaleAgence={true}
          afficherModaleEmail={false}
          afficherModaleOnboarding={false}
          redirectUrl='/mes-jeunes'
        />,
        {
          customConseiller: { structure: structureMilo },
        }
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('contient un message pour demander la structure du conseiller', () => {
      // Then
      expect(
        screen.getByText(/vous devez renseigner votre structure/)
      ).toBeInTheDocument()
    })

    it('affiche un lien pour contacter le support', async () => {
      // Then
      expect(
        screen.getByRole('link', {
          name: 'Contacter le support (nouvelle fenêtre)',
        })
      ).toHaveAttribute('href', 'mailto:support@pass-emploi.beta.gouv.fr')
    })

    it('affiche un lien vers i-milo', async () => {
      // Then
      expect(
        screen.getByRole('link', {
          name: 'Accéder à i-milo (nouvelle fenêtre)',
        })
      ).toHaveAttribute('href', 'https://portail.i-milo.fr/')
    })
  })

  describe('quand le conseiller doit renseigner son agence', () => {
    let agences: Agence[]
    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void

    beforeEach(async () => {
      // Given
      alerteSetter = jest.fn()
      agences = uneListeDAgencesFranceTravail()

      // When
      ;({ container } = await renderWithContexts(
        <HomePage
          afficherModaleAgence={true}
          afficherModaleEmail={false}
          afficherModaleOnboarding={false}
          referentielAgences={agences}
          redirectUrl='/mes-jeunes'
        />,
        {
          customConseiller: { structure: structureFTCej },
          customAlerte: { setter: alerteSetter },
        }
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("contient un message pour demander l'agence du conseiller", () => {
      // Then
      expect(
        screen.getByText(/La liste des agences a été mise à jour/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Une fois votre agence renseignée/)
      ).toBeInTheDocument()
    })

    it('contient un input pour choisir une agence', () => {
      // Then
      expect(
        screen.getByRole('combobox', { name: /votre agence/ })
      ).toBeInTheDocument()
      agences.forEach((agence) =>
        expect(
          screen.getByRole('option', { hidden: true, name: agence.nom })
        ).toBeInTheDocument()
      )
    })

    it("contient un bouton pour dire que l'agence n'est pas dans liste", () => {
      // Then
      expect(
        screen.getByRole('checkbox', { name: /Mon agence n’apparaît pas/ })
      ).toBeInTheDocument()
      expect(() =>
        screen.getByRole('textbox', { name: /Saisir le nom/ })
      ).toThrow()
    })

    it('contient un bouton pour annuler', async () => {
      // Given
      const annuler = screen.getByRole('button', { name: 'Annuler' })

      // When
      await userEvent.click(annuler)

      // Then
      expect(replace).toHaveBeenCalledWith('/mes-jeunes')
    })

    it("modifie le conseiller avec l'agence choisie", async () => {
      // Given
      const agence = agences[2]
      const searchAgence = screen.getByRole('combobox', {
        name: /votre agence/,
      })
      const submit = screen.getByRole('button', { name: 'Ajouter' })

      // When
      await userEvent.type(searchAgence, agence.nom)
      await userEvent.click(submit)

      // Then
      expect(modifierAgence).toHaveBeenCalledWith({
        id: agence.id,
        nom: 'Agence France Travail THIERS',
        codeDepartement: '3',
      })
      expect(alerteSetter).toHaveBeenCalledWith('choixAgence')
      expect(replace).toHaveBeenCalledWith('/mes-jeunes')
    })

    it("prévient si l'agence n'est pas renseignée", async () => {
      // Given
      const searchAgence = screen.getByRole('combobox', {
        name: /votre agence/,
      })
      const submit = screen.getByRole('button', { name: 'Ajouter' })

      // When
      await userEvent.type(searchAgence, 'pouet')
      await userEvent.click(submit)

      // Then
      expect(
        screen.getByText('Sélectionner une agence dans la liste')
      ).toBeInTheDocument()
      expect(modifierAgence).not.toHaveBeenCalled()
      expect(replace).not.toHaveBeenCalled()
    })

    describe("quand l'agence n'est pas dans la liste", () => {
      let searchAgence: HTMLInputElement
      let agenceLibre: HTMLInputElement
      beforeEach(async () => {
        // Given
        searchAgence = screen.getByRole('combobox', {
          name: /Rechercher/,
        })
        await userEvent.type(searchAgence, 'pouet')

        const checkAgenceNonTrouvee = screen.getByRole('checkbox', {
          name: /n’apparaît pas/,
        })
        await userEvent.click(checkAgenceNonTrouvee)

        agenceLibre = screen.getByRole('textbox', {
          name: /Saisir le nom de votre agence/,
        })
      })

      it('permet de renseigner une agence libre', async () => {
        // When
        await userEvent.type(agenceLibre, 'Agence libre')
        const submit = screen.getByRole('button', { name: 'Ajouter' })
        await userEvent.click(submit)

        // Then
        expect(modifierAgence).toHaveBeenCalledWith({
          nom: 'Agence libre',
        })
      })

      it('bloque la sélection dans la liste', () => {
        // Then
        expect(searchAgence.value).toEqual('')
        expect(searchAgence).toHaveAttribute('disabled', '')
      })

      it("prévient si l'agence n'est pas renseignée", async () => {
        // When
        const submit = screen.getByRole('button', { name: 'Ajouter' })
        await userEvent.click(submit)

        // Then
        expect(screen.getByText('Saisir une agence')).toBeInTheDocument()
        expect(modifierAgence).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('quand le conseiller doit renseigner son adresse email', () => {
    beforeEach(async () => {
      // When
      ;({ container } = await renderWithContexts(
        <HomePage
          afficherModaleAgence={false}
          afficherModaleEmail={true}
          afficherModaleOnboarding={false}
          redirectUrl='/mes-jeunes'
        />,
        {
          customConseiller: { structure: structureMilo },
        }
      ))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('contient un message pour demander l’adresse email du conseiller', () => {
      // Then
      expect(
        screen.getByText(/Votre adresse email n’est pas renseignée/)
      ).toBeInTheDocument()
    })

    it('affiche un lien vers i-milo', async () => {
      // Then
      expect(
        screen.getByRole('link', {
          name: 'Accéder à i-milo (nouvelle fenêtre)',
        })
      ).toHaveAttribute(
        'href',
        'https://admin.i-milo.fr/moncompte/coordonnees/'
      )
    })
  })

  describe('quand c’est un nouveau conseiller', () => {
    describe('quand le conseiller est France Travail', () => {
      beforeEach(async () => {
        // When
        ;({ container } = await renderWithContexts(
          <HomePage
            afficherModaleAgence={false}
            afficherModaleEmail={false}
            afficherModaleOnboarding={true}
            redirectUrl='/mes-jeunes'
          />,
          {
            customConseiller: { structure: structureFTCej },
          }
        ))
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche l’onboarding', async () => {
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Bienvenue Nils dans votre espace conseiller CEJ',
          })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('heading', {
            level: 3,
            name: 'Découvrez les principales fonctionnalités de l’outil',
          })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
        // Then
        expect(
          screen.getByRole('heading', { level: 2, name: 'Le portefeuille' })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
        // Then
        expect(
          screen.getByRole('heading', { level: 2, name: 'La messagerie' })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
        // Then
        expect(
          screen.getByRole('heading', { level: 2, name: 'Les offres' })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))
        // Then
        expect(replace).toHaveBeenCalledWith('/mes-jeunes')
      })
    })

    describe('quand le conseiller est Milo', () => {
      beforeEach(async () => {
        // When
        ;({ container } = await renderWithContexts(
          <HomePage
            afficherModaleAgence={false}
            afficherModaleEmail={false}
            afficherModaleOnboarding={true}
            redirectUrl='/mes-jeunes'
          />,
          {
            customConseiller: { structure: structureMilo },
          }
        ))
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche l’onboarding', async () => {
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Bienvenue Nils dans votre espace conseiller CEJ',
          })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('heading', {
            level: 3,
            name: 'Découvrez les principales fonctionnalités de l’outil',
          })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Le portefeuille et l’agenda',
          })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'La messagerie et le pilotage',
          })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Continuer' }))
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Les offres et la réaffectation',
          })
        ).toBeInTheDocument()

        // When
        await userEvent.click(screen.getByRole('button', { name: 'Commencer' }))
        // Then
        expect(replace).toHaveBeenCalledWith('/mes-jeunes')
      })
    })

    describe('quand le conseiller est pass emploi', () => {
      beforeEach(async () => {
        // When
        ;({ container } = await renderWithContexts(
          <HomePage
            afficherModaleAgence={false}
            afficherModaleEmail={false}
            afficherModaleOnboarding={true}
            redirectUrl='/mes-jeunes'
          />,
          {
            customConseiller: {
              structure: 'POLE_EMPLOI_BRSA',
            },
          }
        ))
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche l’onboarding', async () => {
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Bienvenue Nils dans votre espace conseiller pass emploi',
          })
        ).toBeInTheDocument()

        expect(
          screen.getByRole('heading', {
            level: 3,
            name: 'Découvrez les principales fonctionnalités de l’outil',
          })
        ).toBeInTheDocument()
      })
    })
  })
})
