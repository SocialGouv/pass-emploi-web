import {
  fireEvent,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { Mock } from 'jest-mock'
import MiloCreationJeune from 'pages/mes-jeunes/milo/creation-jeune'
import PoleEmploiCreationJeune from 'pages/mes-jeunes/pole-emploi/creation-jeune'
import { JeunesService } from 'services/jeunes.service'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'

describe('MiloCreationJeune', () => {
  let jeunesService: JeunesService
  let page: RenderResult
  let submitButton: HTMLElement
  const emailLabel: string = '*E-mail (ex : monemail@exemple.com)'
  beforeEach(async () => {
    jeunesService = {
      getJeunesDuConseiller: jest.fn(),
      getJeuneDetails: jest.fn(),
      createCompteJeunePassEmploi: jest.fn(),
      createCompteJeunePoleEmploi: jest.fn(),
    }

    page = renderWithSession(
      <DIProvider jeunesService={jeunesService}>
        <PoleEmploiCreationJeune />
      </DIProvider>
    )

    submitButton = screen.getByRole('button', {
      name: 'Créer le compte',
    })
  })

  describe("quand le formulaire n'a pas encore été saisi", () => {
    it('devrait afficher les champ de création de compte', () => {
      // Then
      expect(screen.getByText("Création d'un compte jeune")).toBeInTheDocument()
      expect(
        screen.getByText(
          'Saisissez les coordonnées du jeune pour lequel vous voulez créer un compte'
        )
      ).toBeInTheDocument()
      expect(screen.getByLabelText('*Prénom')).toBeInTheDocument()
      expect(screen.getByLabelText('*Nom')).toBeInTheDocument()
      expect(screen.getByLabelText(emailLabel)).toBeInTheDocument()
    })

    describe('quand on soumet le formulaire avec un champ vide', () => {
      beforeEach(async () => {
        // Given
        const inputFirstname = screen.getByLabelText('*Prénom')
        fireEvent.change(inputFirstname, { target: { value: 'Nadia' } })
        const inputName = screen.getByLabelText('*Nom')
        fireEvent.change(inputName, { target: { value: 'Sanfamiye' } })
        const inputEmail = screen.getByLabelText(emailLabel)
        fireEvent.change(inputEmail, {
          target: { value: 'nadia.sanfamiye@poleemploi.fr' },
        })
      })

      it('demande le remplissage du prénom', async () => {
        // Given
        const inputFirstname = screen.getByLabelText('*Prénom')
        fireEvent.change(inputFirstname, { target: { value: '' } })

        // When
        fireEvent.click(submitButton)

        // Then
        expect(
          screen.getByText('Veuillez remplir le champ')
        ).toBeInTheDocument()
        await waitFor(() => {
          expect(
            jeunesService.createCompteJeunePoleEmploi
          ).toHaveBeenCalledTimes(0)
        })
      })

      it('demande le remplissage du nom', async () => {
        // Given
        const inputName = screen.getByLabelText('*Nom')
        fireEvent.change(inputName, { target: { value: '' } })

        // When
        fireEvent.click(submitButton)

        // Then
        expect(
          screen.getByText('Veuillez remplir le champ')
        ).toBeInTheDocument()
        await waitFor(() => {
          expect(
            jeunesService.createCompteJeunePoleEmploi
          ).toHaveBeenCalledTimes(0)
        })
      })

      it("demande le remplissage de l'email", async () => {
        // Given
        const inputEmail = screen.getByLabelText(emailLabel)
        fireEvent.change(inputEmail, { target: { value: '' } })

        // When
        fireEvent.click(submitButton)

        // Then
        expect(
          screen.getByText('Veuillez remplir le champ')
        ).toBeInTheDocument()
        await waitFor(() => {
          expect(
            jeunesService.createCompteJeunePoleEmploi
          ).toHaveBeenCalledTimes(0)
        })
      })
    })
  })

  describe('quand le formulaire a été saisi', () => {
    beforeEach(() => {
      // Given
      const inputFirstname = screen.getByLabelText('*Prénom')
      fireEvent.change(inputFirstname, { target: { value: 'Nadia' } })
      const inputName = screen.getByLabelText('*Nom')
      fireEvent.change(inputName, { target: { value: 'Sanfamiye' } })
      const inputEmail = screen.getByLabelText(emailLabel)
      fireEvent.change(inputEmail, {
        target: { value: 'nadia.sanfamiye@poleemploi.fr' },
      })
    })

    it("devrait afficher les informations de succès de création d'un compte", async () => {
      // Given
      ;(
        jeunesService.createCompteJeunePoleEmploi as Mock<any>
      ).mockResolvedValue('id-new-jeune')

      // When
      fireEvent.click(submitButton)

      // Then
      await waitFor(() => {
        expect(jeunesService.createCompteJeunePoleEmploi).toHaveBeenCalledTimes(
          1
        )
        expect(jeunesService.createCompteJeunePoleEmploi).toHaveBeenCalledWith(
          {
            firstName: 'Nadia',
            lastName: 'Sanfamiye',
            email: 'nadia.sanfamiye@poleemploi.fr',
          },
          '1',
          'accessToken'
        )
      })

      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Le compte jeune a été créé avec succès.',
        })
      ).toBeInTheDocument()

      expect(
        screen.getByText(
          'Vous pouvez désormais le retrouver dans l\'onglet "Mes jeunes"'
        )
      ).toBeInTheDocument()

      expect(
        screen.getByRole('link', {
          name: 'Accéder à la fiche du jeune',
        })
      ).toBeInTheDocument()

      expect(
        screen.getByRole('link', {
          name: 'Accéder à la fiche du jeune',
        })
      ).toHaveAttribute('href', '/mes-jeunes/id-new-jeune')
    })

    it("devrait afficher un message d'erreur en cas de création de compte en échec", async () => {
      // Given
      ;(
        jeunesService.createCompteJeunePoleEmploi as Mock<any>
      ).mockRejectedValue({
        message: "un message d'erreur",
      })

      // When
      fireEvent.click(submitButton)

      // Then
      await waitFor(() => {
        expect(jeunesService.createCompteJeunePoleEmploi).toHaveBeenCalledTimes(
          1
        )
      })
      expect(screen.getByText("un message d'erreur")).toBeInTheDocument()
    })
  })
})
