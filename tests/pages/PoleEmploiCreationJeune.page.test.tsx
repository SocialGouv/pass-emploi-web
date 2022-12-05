import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Mock } from 'jest-mock'
import { useRouter } from 'next/router'

import { mockedJeunesService } from 'fixtures/services'
import PoleEmploiCreationJeune from 'pages/mes-jeunes/pole-emploi/creation-jeune'
import { AlerteParam } from 'referentiel/alerteParam'
import { JeunesService } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'

describe('PoleEmploiCreationJeune', () => {
  let jeunesService: JeunesService
  let submitButton: HTMLElement

  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let push: Function
  const emailLabel: string = '* E-mail (ex : monemail@exemple.com)'
  beforeEach(async () => {
    jeunesService = mockedJeunesService()
    alerteSetter = jest.fn()
    push = jest.fn(() => Promise.resolve())
    ;(useRouter as jest.Mock).mockReturnValue({ push })
    renderWithContexts(<PoleEmploiCreationJeune />, {
      customDependances: { jeunesService },
      customAlerte: { alerteSetter },
    })

    submitButton = screen.getByRole('button', {
      name: 'Créer le compte',
    })
  })

  describe("quand le formulaire n'a pas encore été soumis", () => {
    it('devrait afficher les champ de création de compte', () => {
      // Then
      expect(
        screen.getByText(
          'Saisissez les coordonnées du jeune pour lequel vous voulez créer un compte'
        )
      ).toBeInTheDocument()
      expect(screen.getByLabelText('* Prénom')).toBeInTheDocument()
      expect(screen.getByLabelText('* Nom')).toBeInTheDocument()
      expect(screen.getByLabelText(emailLabel)).toBeInTheDocument()
    })

    describe('quand on soumet le formulaire avec un champ incorrect', () => {
      beforeEach(async () => {
        // Given
        const inputFirstname = screen.getByLabelText('* Prénom')
        await userEvent.type(inputFirstname, 'Nadia')
        const inputName = screen.getByLabelText('* Nom')
        await userEvent.type(inputName, 'Sanfamiye')
        const inputEmail = screen.getByLabelText(emailLabel)
        await userEvent.type(inputEmail, 'nadia.sanfamiye@poleemploi.fr')
      })

      it('demande le remplissage du prénom', async () => {
        // Given
        const inputFirstname = screen.getByLabelText('* Prénom')
        await userEvent.clear(inputFirstname)

        // When
        await userEvent.click(submitButton)

        // Then
        expect(
          screen.getByText('Veuillez renseigner le prénom du jeune')
        ).toBeInTheDocument()
        expect(jeunesService.createCompteJeunePoleEmploi).toHaveBeenCalledTimes(
          0
        )
      })

      it('demande le remplissage du nom', async () => {
        // Given
        const inputName = screen.getByLabelText('* Nom')
        await userEvent.clear(inputName)

        // When
        await userEvent.click(submitButton)

        // Then
        expect(
          screen.getByText('Veuillez renseigner le nom du jeune')
        ).toBeInTheDocument()
        expect(jeunesService.createCompteJeunePoleEmploi).toHaveBeenCalledTimes(
          0
        )
      })

      it("demande le remplissage de l'email", async () => {
        // Given
        const inputEmail = screen.getByLabelText(emailLabel)
        await userEvent.clear(inputEmail)

        // When
        await userEvent.click(submitButton)

        // Then
        expect(
          screen.getByText("Veuillez renseigner l'e-mail du jeune")
        ).toBeInTheDocument()
        expect(jeunesService.createCompteJeunePoleEmploi).toHaveBeenCalledTimes(
          0
        )
      })
    })
  })

  describe('quand le formulaire a été soumis', () => {
    beforeEach(async () => {
      // Given
      const inputFirstname = screen.getByLabelText('* Prénom')
      await userEvent.type(inputFirstname, 'Nadia')
      const inputName = screen.getByLabelText('* Nom')
      await userEvent.type(inputName, 'Sanfamiye')
      const inputEmail = screen.getByLabelText(emailLabel)
      await userEvent.type(inputEmail, 'nadia.sanfamiye@poleemploi.fr')
    })

    it('devrait revenir sur la page des jeunes du conseiller', async () => {
      // Given
      ;(
        jeunesService.createCompteJeunePoleEmploi as Mock<any>
      ).mockResolvedValue({
        id: 'un-id',
        firstName: 'Nadia',
        lastName: 'Sanfamiye',
      })

      // When
      await userEvent.click(submitButton)

      // Then
      expect(jeunesService.createCompteJeunePoleEmploi).toHaveBeenCalledTimes(1)
      expect(jeunesService.createCompteJeunePoleEmploi).toHaveBeenCalledWith({
        firstName: 'Nadia',
        lastName: 'Sanfamiye',
        email: 'nadia.sanfamiye@poleemploi.fr',
      })

      expect(alerteSetter).toHaveBeenCalledWith('creationBeneficiaire', 'un-id')
      expect(push).toHaveBeenCalledWith('/mes-jeunes')
    })

    it("devrait afficher un message d'erreur en cas de création de compte en échec", async () => {
      // Given
      ;(
        jeunesService.createCompteJeunePoleEmploi as Mock<any>
      ).mockRejectedValue({
        message: "un message d'erreur",
      })

      // When
      await userEvent.click(submitButton)

      // Then
      expect(jeunesService.createCompteJeunePoleEmploi).toHaveBeenCalledTimes(1)
      expect(screen.getByText("un message d'erreur")).toBeInTheDocument()
    })
  })
})
