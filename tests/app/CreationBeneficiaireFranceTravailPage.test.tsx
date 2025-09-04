import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'

import CreationBeneficiaireFranceTravailPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/creation-jeune/CreationBeneficiaireFranceTravailPage'
import {
  desItemsBeneficiaires,
  uneBaseBeneficiaire,
} from 'fixtures/beneficiaire'
import { desListes } from 'fixtures/listes'
import {
  extractBeneficiaireWithActivity,
  Portefeuille,
} from 'interfaces/beneficiaire'
import { Liste } from 'interfaces/liste'
import { structureAvenirPro } from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import { createCompteJeuneFranceTravail } from 'services/beneficiaires.service'
import { ajouterBeneficiaireAListe } from 'services/listes.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/listes.service')

describe('CreationBeneficiaireFranceTravailPage client side', () => {
  let container: HTMLElement
  let submitButton: HTMLElement

  let push: () => void
  let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
  let portefeuilleSetter: (updatedBeneficiaires: Portefeuille) => void
  let portefeuille: Portefeuille
  const emailLabel: string = '* E-mail (ex : monemail@exemple.com)'
  beforeEach(async () => {
    push = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ push })
    alerteSetter = jest.fn()
    portefeuilleSetter = jest.fn()
    portefeuille = desItemsBeneficiaires().map(extractBeneficiaireWithActivity)
  })

  describe('quand le conseiller n’est pas Avenir Pro', () => {
    beforeEach(async () => {
      ;({ container } = await renderWithContexts(
        <CreationBeneficiaireFranceTravailPage />,
        {
          customAlerte: { setter: alerteSetter },
          customPortefeuille: { setter: portefeuilleSetter },
        }
      ))

      submitButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })
    })

    describe("quand le formulaire n'a pas encore été soumis", () => {
      it('a11y', async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

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
          await userEvent.type(inputEmail, 'nadia.sanfamiye@francetravail.fr')
        })

        it('a11y', async () => {
          const results = await axe(container)
          expect(results).toHaveNoViolations()
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
          expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(0)
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
          expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(0)
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
          expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(0)
        })
      })
    })

    describe('quand le formulaire a été soumis', () => {
      const now = DateTime.now()
      beforeEach(async () => {
        // Given
        jest.spyOn(DateTime, 'now').mockReturnValue(now)
        const inputFirstname = screen.getByLabelText('* Prénom')
        await userEvent.type(inputFirstname, 'Nadia')
        const inputName = screen.getByLabelText('* Nom')
        await userEvent.type(inputName, 'Sanfamiye')
        const inputEmail = screen.getByLabelText(emailLabel)
        await userEvent.type(inputEmail, 'nadia.sanfamiye@francetravail.fr')
      })

      it('a11y', async () => {
        // Given
        ;(createCompteJeuneFranceTravail as jest.Mock).mockResolvedValue(
          uneBaseBeneficiaire()
        )

        // When
        await userEvent.click(submitButton)

        //Then
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('devrait revenir sur la page des jeunes du conseiller', async () => {
        // Given
        ;(createCompteJeuneFranceTravail as jest.Mock).mockResolvedValue(
          uneBaseBeneficiaire()
        )

        // When
        await userEvent.click(submitButton)

        // Then
        expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(1)
        expect(createCompteJeuneFranceTravail).toHaveBeenCalledWith({
          firstName: 'Nadia',
          lastName: 'Sanfamiye',
          email: 'nadia.sanfamiye@francetravail.fr',
        })

        expect(portefeuilleSetter).toHaveBeenCalledWith([
          ...portefeuille,
          {
            ...uneBaseBeneficiaire(),
            creationDate: now.toISO(),
            estAArchiver: false,
          },
        ])
        expect(alerteSetter).toHaveBeenCalledWith(
          'creationBeneficiaire',
          'id-beneficiaire-1'
        )
        expect(push).toHaveBeenCalledWith('/mes-jeunes')
      })

      it("devrait afficher un message d'erreur en cas de création de compte en échec", async () => {
        // Given
        ;(createCompteJeuneFranceTravail as jest.Mock).mockRejectedValue({
          message: "un message d'erreur",
        })

        // When
        await userEvent.click(submitButton)

        // Then
        expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(1)
        await waitFor(() => {
          expect(screen.getByText("un message d'erreur")).toBeInTheDocument()
        })
      })
    })
  })

  describe('quand le conseiller est Avenir Pro', () => {
    let listes: Liste[]
    beforeEach(async () => {
      listes = desListes()
      ;({ container } = await renderWithContexts(
        <CreationBeneficiaireFranceTravailPage listes={listes} />,
        {
          customAlerte: { setter: alerteSetter },
          customPortefeuille: { setter: portefeuilleSetter },
          customConseiller: {
            structure: structureAvenirPro,
          },
        }
      ))

      submitButton = screen.getByRole('button', {
        name: 'Créer le compte',
      })
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche le champ de sélection de la liste', () => {
      // Then
      expect(
        screen.getByRole('combobox', {
          name: /Sélectionnez la liste du bénéficiaire/,
        })
      ).toBeInTheDocument()
      listes.forEach((l) => {
        expect(
          screen.getByRole('option', {
            name: l.titre,
          })
        ).toBeInTheDocument()
      })
    })

    it('affiche une checkbox pour valider l’âge du bénéficiaire', () => {
      // Then
      expect(
        screen.getByRole('checkbox', {
          name: 'Je certifie que le jeune renseigné est âgé de 15 ans ou plus à la date de création du compte.',
        })
      ).toBeInTheDocument()
    })

    describe('quand le formulaire a été soumis', () => {
      const now = DateTime.now()
      beforeEach(async () => {
        // Given
        jest.spyOn(DateTime, 'now').mockReturnValue(now)
        const inputFirstname = screen.getByLabelText('* Prénom')
        await userEvent.type(inputFirstname, 'Nadia')
        const inputName = screen.getByLabelText('* Nom')
        await userEvent.type(inputName, 'Sanfamiye')
        const inputEmail = screen.getByLabelText(emailLabel)
        await userEvent.type(inputEmail, 'nadia.sanfamiye@francetravail.fr')
        const selectListe = screen.getByLabelText(
          '* Sélectionnez la liste du bénéficiaire'
        )
        await userEvent.selectOptions(selectListe, listes[0].titre)
        const checkboxAge = screen.getByRole('checkbox', {
          name: 'Je certifie que le jeune renseigné est âgé de 15 ans ou plus à la date de création du compte.',
        })
        await userEvent.click(checkboxAge)
      })

      it('a11y', async () => {
        // Given
        ;(createCompteJeuneFranceTravail as jest.Mock).mockResolvedValue(
          uneBaseBeneficiaire()
        )

        // When
        await userEvent.click(submitButton)

        //Then
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('devrait revenir sur la page des jeunes du conseiller', async () => {
        // Given
        ;(createCompteJeuneFranceTravail as jest.Mock).mockResolvedValue(
          uneBaseBeneficiaire()
        )
        ;(ajouterBeneficiaireAListe as jest.Mock).mockResolvedValue({})

        // When
        await userEvent.click(submitButton)

        // Then
        expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(1)
        expect(createCompteJeuneFranceTravail).toHaveBeenCalledWith({
          firstName: 'Nadia',
          lastName: 'Sanfamiye',
          email: 'nadia.sanfamiye@francetravail.fr',
        })
        expect(ajouterBeneficiaireAListe).toHaveBeenCalledWith(
          listes[0].id,
          'id-beneficiaire-1',
          'id-conseiller-1'
        )

        expect(portefeuilleSetter).toHaveBeenCalledWith([
          ...portefeuille,
          {
            ...uneBaseBeneficiaire(),
            creationDate: now.toISO(),
            estAArchiver: false,
          },
        ])
        expect(alerteSetter).toHaveBeenCalledWith(
          'creationBeneficiaire',
          'id-beneficiaire-1'
        )
        expect(push).toHaveBeenCalledWith('/mes-jeunes')
      })

      it("devrait afficher un message d'erreur en cas de création de compte en échec", async () => {
        // Given
        ;(createCompteJeuneFranceTravail as jest.Mock).mockRejectedValue({
          message: "un message d'erreur",
        })

        // When
        await userEvent.click(submitButton)

        // Then
        expect(createCompteJeuneFranceTravail).toHaveBeenCalledTimes(1)
        await waitFor(() => {
          expect(screen.getByText("un message d'erreur")).toBeInTheDocument()
        })
      })
    })
  })
})
