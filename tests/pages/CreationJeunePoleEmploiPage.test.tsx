import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Mock } from 'jest-mock'
import { useRouter } from 'next/navigation'

import CreationJeunePoleEmploiPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/pole-emploi/CreationJeunePoleEmploiPage'
import { desItemsJeunes, extractBaseJeune, uneBaseJeune } from 'fixtures/jeune'
import { BaseJeune } from 'interfaces/jeune'
import { AlerteParam } from 'referentiel/alerteParam'
import { createCompteJeunePoleEmploi } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/jeunes.service')

describe('CreationJeunePoleEmploiPage client side', () => {
  let submitButton: HTMLElement

  let push: Function
  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let portefeuilleSetter: (updatedBeneficiaires: BaseJeune[]) => void
  let portefeuille: BaseJeune[]
  const emailLabel: string = '* E-mail (ex : monemail@exemple.com)'
  beforeEach(async () => {
    push = jest.fn(() => Promise.resolve())
    ;(useRouter as jest.Mock).mockReturnValue({ push })
    alerteSetter = jest.fn()
    portefeuilleSetter = jest.fn()
    portefeuille = desItemsJeunes().map(extractBaseJeune)

    renderWithContexts(<CreationJeunePoleEmploiPage />, {
      customAlerte: { alerteSetter },
      customPortefeuille: { setter: portefeuilleSetter },
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
          'Saisissez les coordonnées du bénéficiaire pour lequel vous voulez créer un compte'
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
          screen.getByText('Veuillez renseigner le prénom du bénéficiaire')
        ).toBeInTheDocument()
        expect(createCompteJeunePoleEmploi).toHaveBeenCalledTimes(0)
      })

      it('demande le remplissage du nom', async () => {
        // Given
        const inputName = screen.getByLabelText('* Nom')
        await userEvent.clear(inputName)

        // When
        await userEvent.click(submitButton)

        // Then
        expect(
          screen.getByText('Veuillez renseigner le nom du bénéficiaire')
        ).toBeInTheDocument()
        expect(createCompteJeunePoleEmploi).toHaveBeenCalledTimes(0)
      })

      it("demande le remplissage de l'email", async () => {
        // Given
        const inputEmail = screen.getByLabelText(emailLabel)
        await userEvent.clear(inputEmail)

        // When
        await userEvent.click(submitButton)

        // Then
        expect(
          screen.getByText("Veuillez renseigner l'e-mail du bénéficiaire")
        ).toBeInTheDocument()
        expect(createCompteJeunePoleEmploi).toHaveBeenCalledTimes(0)
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
      ;(createCompteJeunePoleEmploi as Mock<any>).mockResolvedValue(
        uneBaseJeune()
      )

      // When
      await userEvent.click(submitButton)

      // Then
      expect(createCompteJeunePoleEmploi).toHaveBeenCalledTimes(1)
      expect(createCompteJeunePoleEmploi).toHaveBeenCalledWith({
        firstName: 'Nadia',
        lastName: 'Sanfamiye',
        email: 'nadia.sanfamiye@poleemploi.fr',
      })

      expect(portefeuilleSetter).toHaveBeenCalledWith([
        ...portefeuille,
        uneBaseJeune(),
      ])
      expect(alerteSetter).toHaveBeenCalledWith('creationBeneficiaire', {
        variable: 'Kenji Jirac',
        target: 'jeune-1',
      })
      expect(push).toHaveBeenCalledWith('/mes-jeunes')
    })

    it("devrait afficher un message d'erreur en cas de création de compte en échec", async () => {
      // Given
      ;(createCompteJeunePoleEmploi as Mock<any>).mockRejectedValue({
        message: "un message d'erreur",
      })

      // When
      await userEvent.click(submitButton)

      // Then
      expect(createCompteJeunePoleEmploi).toHaveBeenCalledTimes(1)
      expect(screen.getByText("un message d'erreur")).toBeInTheDocument()
    })
  })
})
