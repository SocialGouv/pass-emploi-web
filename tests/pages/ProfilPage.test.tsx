import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { useRouter } from 'next/navigation'

import ProfilPage from 'app/(connected)/(with-sidebar)/(with-chat)/profil/ProfilPage'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import { BeneficiaireFromListe } from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { structureFTCej, structureMilo } from 'interfaces/structure'
import { getBeneficiairesDuConseillerClientSide } from 'services/beneficiaires.service'
import {
  modifierAgence,
  modifierNotificationsSonores,
  supprimerConseiller,
} from 'services/conseiller.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/conseiller.service')
jest.mock('services/beneficiaires.service')
jest.mock('components/ModalContainer')

describe('ProfilPage client side', () => {
  let container: HTMLElement
  let jeunes: BeneficiaireFromListe[]
  let push: () => void

  describe('contenu', () => {
    const conseiller: Conseiller = unConseiller({
      email: 'nils.tavernier@mail.com',
      structure: structureFTCej,
      agence: { nom: 'MLS3F SAINT-LOUIS' },
    })
    beforeEach(async () => {
      // Given

      // When
      await act(async () => {
        ;({ container } = renderWithContexts(
          <ProfilPage referentielMissionsLocales={[]} />,
          {
            customConseiller: conseiller,
          }
        ))
      })
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche les informations du conseiller', () => {
      // Then
      expect(screen.getByText('Nils Tavernier')).toBeInTheDocument()
      expect(getByDescriptionTerm('Votre e-mail :')).toHaveTextContent(
        'nils.tavernier@mail.com'
      )
      expect(getByDescriptionTerm('Votre agence :')).toHaveTextContent(
        'MLS3F SAINT-LOUIS'
      )
    })

    it("contient un champ pour sélectionner l'activation des notifications", () => {
      // When
      const toggleNotifications = getToggleNotifications()

      // Then
      expect(toggleNotifications).toBeInTheDocument()
      expect(toggleNotifications).not.toBeChecked()
    })

    it('affiche un bouton pour supprimer le compte', () =>
      // Then
      expect(screen.getByText('Supprimer mon compte')).toBeInTheDocument())
  })

  describe('quand il manque des informations', () => {
    beforeEach(async () => {
      // When
      await act(async () => {
        ;({ container } = renderWithContexts(
          <ProfilPage referentielMissionsLocales={[]} />
        ))
      })
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it("n'affiche pas les informations manquantes", async () => {
      // Then
      expect(() => screen.getByRole('term', { name: /Votre e-mail/ })).toThrow()
      expect(() => screen.getByRole('term', { name: /Votre agence/ })).toThrow()
    })
  })

  describe('quand le conseiller est MILO', () => {
    describe('si son agence est déjà renseignée', () => {
      beforeEach(async () => {
        // Given
        const conseiller = unConseiller({
          structure: structureMilo,
          agence: { nom: 'MLS3F SAINT-LOUIS' },
        })

        // When
        await act(async () => {
          ;({ container } = renderWithContexts(
            <ProfilPage referentielMissionsLocales={[]} />,
            {
              customConseiller: conseiller,
            }
          ))
        })
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche le label correspondant', async () => {
        // Then
        expect(
          getByDescriptionTerm('Votre Mission Locale :')
        ).toHaveTextContent('MLS3F SAINT-LOUIS')
      })

      it('affiche un lien vers le support pour changer d’agence', async () => {
        // Then
        expect(
          screen.getByRole('link', {
            name: /contacter le support/,
          })
        ).toHaveAttribute('href', 'mailto:support@pass-emploi.beta.gouv.fr')
      })
    })

    describe('si son agence n’est pas encore renseignée', () => {
      const agences = uneListeDAgencesMILO()
      beforeEach(async () => {
        // Given
        const conseiller = unConseiller({
          structure: structureMilo,
        })

        // When
        await act(async () => {
          ;({ container } = renderWithContexts(
            <ProfilPage referentielMissionsLocales={agences} />,
            {
              customConseiller: conseiller,
            }
          ))
        })
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('contient un input pour choisir un département', () => {
        // Then
        expect(
          screen.getByRole('textbox', { name: /Département/ })
        ).toBeInTheDocument()
      })

      it('contient un input pour choisir une Mission Locale', () => {
        // Then
        expect(
          screen.getByRole('combobox', {
            name: /Recherchez votre Mission Locale/,
          })
        ).toBeInTheDocument()
        agences.forEach((agence) =>
          expect(
            screen.getByRole('option', { hidden: true, name: agence.nom })
          ).toBeInTheDocument()
        )
      })

      it('filtre les Missions locales selon le département entré', async () => {
        // Given
        const codeDepartement = '1'
        const departementInput = screen.getByRole('textbox', {
          name: /Département/,
        })

        // When
        await userEvent.type(departementInput, codeDepartement)

        // Then
        agences
          .filter((agence) => agence.codeDepartement === codeDepartement)
          .forEach((agence) =>
            expect(
              screen.getByRole('option', { hidden: true, name: agence.nom })
            ).toBeInTheDocument()
          )

        agences
          .filter((agence) => agence.codeDepartement !== codeDepartement)
          .forEach((agence) =>
            expect(
              screen.queryByRole('option', { hidden: true, name: agence.nom })
            ).not.toBeInTheDocument()
          )
      })

      it('supprime les préfixes 0 dans l’application du filtre selon le département entré', async () => {
        // Given
        const codeDepartement = '01'
        const departementInput = screen.getByRole('textbox', {
          name: /Département/,
        })

        // When
        await userEvent.type(departementInput, codeDepartement)

        // Then
        expect(
          screen.getByRole('option', {
            hidden: true,
            name: 'MLS3F SAINT-LOUIS',
          })
        ).toBeInTheDocument()
      })

      it('contient une option pour dire que la Mission Locale n’est pas dans la liste', () => {
        // Then
        expect(
          screen.getByRole('option', {
            hidden: true,
            name: 'Ma Mission Locale n’apparaît pas dans la liste',
          })
        ).toBeInTheDocument()
      })

      it('affiche un lien vers le support quand la Mission Locale n’est pas dans la liste', async () => {
        // Given
        const missionLocaleInput = screen.getByRole('combobox', {
          name: /Recherchez votre Mission Locale/,
        })

        // When
        await userEvent.selectOptions(
          missionLocaleInput,
          'Ma Mission Locale n’apparaît pas dans la liste'
        )

        // Then
        expect(
          screen.getByText(/vous devez contacter le support/)
        ).toBeInTheDocument()
        expect(
          screen.getByRole('link', {
            name: 'Contacter le support (nouvelle fenêtre)',
          })
        ).toHaveAttribute('href', 'mailto:support@pass-emploi.beta.gouv.fr')
      })

      it("modifie le conseiller avec l'agence choisie", async () => {
        // Given
        const departementInput = screen.getByRole('textbox', {
          name: /Département/,
        })
        await userEvent.type(departementInput, '1')
        const missionLocaleInput = screen.getByRole('combobox', {
          name: /Recherchez votre Mission Locale/,
        })
        await userEvent.selectOptions(missionLocaleInput, 'MLS3F SAINT-LOUIS')

        // When
        const submit = screen.getByRole('button', { name: 'Ajouter' })
        await userEvent.click(submit)

        // Then
        expect(modifierAgence).toHaveBeenCalledWith({
          id: '443',
          nom: 'MLS3F SAINT-LOUIS',
          codeDepartement: '1',
        })
      })

      it("ne fait rien si l'agence n'est pas renseignée", async () => {
        // Given
        const submit = screen.getByRole('button', { name: 'Ajouter' })

        // When
        await userEvent.click(submit)

        // Then
        expect(modifierAgence).not.toHaveBeenCalled()
      })
    })

    describe('si son adresse email n’est pas encore renseignée', () => {
      const agences = uneListeDAgencesMILO()
      const conseiller = unConseiller({
        structure: structureMilo,
        email: undefined,
      })

      beforeEach(async () => {
        // When
        await act(async () => {
          ;({ container } = renderWithContexts(
            <ProfilPage referentielMissionsLocales={agences} />,
            {
              customConseiller: conseiller,
            }
          ))
        })
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('contient à renseigner son adresse mail', async () => {
        // Then
        expect(
          screen.getByText('Votre adresse mail n’est pas renseignée')
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            'Renseignez votre adresse e-mail dans l’encart ”Contacts personnels” de votre profil i-milo.'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByRole('link', { name: /Accéder à i-milo/ })
        ).toBeInTheDocument()
      })
    })
  })

  describe('Supprimer un compte', () => {
    describe('en tant que conseiller sans bénéficiaires', () => {
      const conseiller = unConseiller({
        email: 'conseiller@pole-emploi.fr',
        structure: structureFTCej,
      })
      beforeEach(async () => {
        // Given
        ;(
          getBeneficiairesDuConseillerClientSide as jest.Mock
        ).mockResolvedValue([])
        push = jest.fn()
        ;(useRouter as jest.Mock).mockReturnValue({ push })

        // When
        await act(async () => {
          ;({ container } = renderWithContexts(
            <ProfilPage referentielMissionsLocales={[]} />,
            {
              customConseiller: conseiller,
            }
          ))
        })

        const supprimerConseillerButton = screen.getByRole('button', {
          name: 'Supprimer mon compte',
        })

        await userEvent.click(supprimerConseillerButton)
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche une modale avec les bonnes informations', async () => {
        // Then
        expect(
          screen.getByText(/Souhaitez-vous supprimer le compte conseiller/)
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: 'Supprimer le compte' })
        ).toBeInTheDocument()
      })

      it('lors de la confirmation, supprime le conseiller et redirige vers la page de connexion', async () => {
        // Given
        const confirmerSuppressionButton = screen.getByRole('button', {
          name: 'Supprimer le compte',
        })

        // When
        await userEvent.click(confirmerSuppressionButton)
        await act(() => new Promise((r) => setTimeout(r, 500)))

        // Then
        expect(
          screen.getByText('Vous allez être redirigé dans quelques secondes')
        ).toBeInTheDocument()
        expect(supprimerConseiller).toHaveBeenCalledWith(conseiller.id)
        await act(() => new Promise((r) => setTimeout(r, 3000)))

        expect(push).toHaveBeenCalledWith('/api/auth/federated-logout')
      })
    })

    describe('en tant que conseiller avec bénéficiaires', () => {
      const conseiller = unConseiller({
        email: 'conseiller@milo.fr',
        structure: structureMilo,
      })
      beforeEach(async () => {
        // Given
        jeunes = desItemsBeneficiaires()
        ;(
          getBeneficiairesDuConseillerClientSide as jest.Mock
        ).mockResolvedValue(jeunes)

        // When
        await act(async () => {
          ;({ container } = renderWithContexts(
            <ProfilPage referentielMissionsLocales={[]} />,
            {
              customConseiller: conseiller,
            }
          ))
        })

        const supprimerConseillerButton = screen.getByRole('button', {
          name: 'Supprimer mon compte',
        })
        await userEvent.click(supprimerConseillerButton)
      })

      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('affiche une modale avec les bonnes informations', async () => {
        // Then
        expect(screen.getByText('Fermer')).toBeInTheDocument()
        expect(
          screen.getByText(
            /Pour supprimer votre compte, vos bénéficiaires doivent être transférés à un conseiller./
          )
        ).toBeInTheDocument()
        expect(() => screen.getByText('Supprimer le compte')).toThrow()
      })
    })
  })

  describe('quand on change le paramétrage des notifications', () => {
    it('met à jour côté API', async () => {
      // Given
      const conseiller = unConseiller({
        notificationsSonores: false,
      })

      await act(async () => {
        renderWithContexts(<ProfilPage referentielMissionsLocales={[]} />, {
          customConseiller: conseiller,
        })
      })

      const toggleNotifications = getToggleNotifications()

      // When
      await userEvent.click(toggleNotifications)

      // Then
      expect(modifierNotificationsSonores).toHaveBeenCalledWith(
        conseiller.id,
        !conseiller.notificationsSonores
      )
    })
  })
})

function getToggleNotifications() {
  return screen.getByRole<HTMLInputElement>('switch', {
    name: 'Recevoir des notifications sonores pour la réception de nouveaux messages',
  })
}
