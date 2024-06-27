import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'

import CreationBeneficiaireMiloPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireMiloPage'
import {
  desItemsBeneficiaires,
  extractBaseBeneficiaire,
  uneBaseBeneficiaire,
} from 'fixtures/beneficiaire'
import { unDossierMilo } from 'fixtures/milo'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import {
  createCompteJeuneMilo,
  getDossierJeune,
} from 'services/conseiller.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/conseiller.service')

describe('CreationBeneficiaireMiloPage client side', () => {
  describe("quand le dossier n'a pas encore été saisi", () => {
    beforeEach(() => {
      renderWithContexts(<CreationBeneficiaireMiloPage />)
    })

    it('devrait afficher le champ de recherche de dossier', () => {
      // Then
      expect(
        screen.getByText(
          'Saisissez le numéro de dossier du jeune pour lequel vous voulez créer un compte'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole('textbox', { name: 'Numéro de dossier' })
      ).toBeInTheDocument()
    })

    it("quand on soumet la recherche avec une valeur vide, affiche un message d'erreur", async () => {
      // Given
      const submitButton = screen.getByRole('button', {
        name: 'Valider le numéro',
      })
      const inputSearch = screen.getByRole('textbox', {
        name: 'Numéro de dossier',
      })
      await userEvent.clear(inputSearch)

      // When
      await userEvent.click(submitButton)

      // Then
      expect(
        screen.getByText(
          'Le champ "Numéro de dossier" est vide. Renseigner un numéro. Exemple : 123456'
        )
      ).toBeInTheDocument()
    })
  })

  describe('quand on a recherché un dossier', () => {
    let push: Function
    let setAlerte: () => void
    let setPortefeuille: (updatedBeneficiaires: BaseBeneficiaire[]) => void
    const dossier = unDossierMilo()
    const portefeuille = desItemsBeneficiaires().map(extractBaseBeneficiaire)
    beforeEach(async () => {
      // Given
      ;(getDossierJeune as jest.Mock).mockResolvedValue(dossier)
      ;(createCompteJeuneMilo as jest.Mock).mockResolvedValue(
        uneBaseBeneficiaire()
      )

      push = jest.fn(() => Promise.resolve())
      setAlerte = jest.fn()
      setPortefeuille = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push })

      renderWithContexts(<CreationBeneficiaireMiloPage />, {
        customAlerte: { alerteSetter: setAlerte },
        customPortefeuille: { setter: setPortefeuille },
      })

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Numéro de dossier' }),
        '123456'
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Valider le numéro' })
      )
    })

    it('devrait revenir sur la page des jeunes du conseiller', async () => {
      // When
      const createCompteButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })
      await userEvent.click(createCompteButton)

      // Then
      expect(createCompteJeuneMilo).toHaveBeenCalledWith({
        email: 'kenji-faux-mail@mail.com',
        idDossier: '1234',
        nom: 'GIRAC',
        prenom: 'Kenji',
      })

      expect(setPortefeuille).toHaveBeenCalledWith([
        ...portefeuille,
        uneBaseBeneficiaire(),
      ])
      expect(setAlerte).toHaveBeenCalledWith(
        'creationBeneficiaire',
        'beneficiaire-1'
      )
      expect(push).toHaveBeenCalledWith('/mes-jeunes')
    })

    it("devrait afficher un message d'erreur en cas de création de compte en échec", async () => {
      // Given
      ;(createCompteJeuneMilo as jest.Mock).mockRejectedValue({
        message: "un message d'erreur",
      })

      // When
      const createCompteButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })

      await userEvent.click(createCompteButton)

      // Then
      expect(createCompteJeuneMilo).toHaveBeenCalledTimes(1)
      expect(screen.getByText("un message d'erreur")).toBeInTheDocument()
    })
  })
})
