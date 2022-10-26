import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import { unConseiller } from 'fixtures/conseiller'
import {
  uneListeDAgencesMILO,
  uneListeDAgencesPoleEmploi,
} from 'fixtures/referentiel'
import { mockedConseillerService } from 'fixtures/services'
import { StructureConseiller } from 'interfaces/conseiller'
import { Agence } from 'interfaces/referentiel'
import Home, { getServerSideProps } from 'pages/index'
import { ConseillerService } from 'services/conseiller.service'
import { ReferentielService } from 'services/referentiel.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('components/Modal')

describe('Home', () => {
  describe('client side', () => {
    describe('quand le conseiller n’est pas Mission locale', () => {
      let agences: Agence[]
      let replace: jest.Mock
      let conseillerService: ConseillerService
      beforeEach(() => {
        // Given
        replace = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ replace })
        agences = uneListeDAgencesPoleEmploi()
        conseillerService = mockedConseillerService()

        // When
        renderWithContexts(
          <Home referentielAgences={agences} redirectUrl='/mes-jeunes' />,
          {
            customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
            customDependances: { conseillerService },
          }
        )
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
        expect(conseillerService.modifierAgence).toHaveBeenCalledWith({
          id: agence.id,
          nom: 'Agence Pôle emploi THIERS',
          codeDepartement: '3',
        })
        expect(replace).toHaveBeenCalledWith('/mes-jeunes?choixAgence=succes')
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
        expect(conseillerService.modifierAgence).not.toHaveBeenCalled()
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
          expect(conseillerService.modifierAgence).toHaveBeenCalledWith({
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
          expect(conseillerService.modifierAgence).toHaveBeenCalledTimes(0)
        })
      })
    })

    describe('quand le conseiller est Mission locale', () => {
      let agences: Agence[]
      let replace: jest.Mock
      let conseillerService: ConseillerService
      beforeEach(() => {
        // Given
        replace = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ replace })
        agences = uneListeDAgencesMILO()
        conseillerService = mockedConseillerService()

        // When
        renderWithContexts(
          <Home referentielAgences={agences} redirectUrl='/mes-jeunes' />,
          {
            customConseiller: { structure: StructureConseiller.MILO },
            customDependances: { conseillerService },
          }
        )
      })

      it('contient un message pour demander la Mission locale du conseiller', () => {
        // Then
        expect(
          screen.getByText(/Une fois votre Mission locale renseignée/)
        ).toBeInTheDocument()
      })

      it('contient un input pour choisir un département', () => {
        // Then
        expect(
          screen.getByRole('textbox', { name: /Département/ })
        ).toBeInTheDocument()
      })

      it('contient un input pour choisir une Mission locale', () => {
        // Then
        expect(
          screen.getByRole('combobox', {
            name: /Recherchez votre Mission locale/,
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

      it('contient une option pour dire que la Mission locale n’est pas dans la liste', () => {
        // Then
        expect(
          screen.getByRole('option', {
            hidden: true,
            name: 'Ma mission locale n’apparaît pas dans la liste',
          })
        ).toBeInTheDocument()
      })

      it('affiche un lien vers le support quand la Mission locale n’est pas dans la liste', async () => {
        // Given
        const missionLocaleInput = screen.getByRole('combobox', {
          name: /Recherchez votre Mission locale/,
        })

        // When
        await userEvent.selectOptions(
          missionLocaleInput,
          'Ma mission locale n’apparaît pas dans la liste'
        )

        // Then
        expect(
          screen.getByText(/vous devez contacter le support/)
        ).toBeInTheDocument()
        expect(
          screen.getByRole('link', { name: 'Contacter le support' })
        ).toHaveAttribute('href', 'mailto:support@pass-emploi.beta.gouv.fr')
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
        const departementInput = screen.getByRole('textbox', {
          name: /Département/,
        })
        await userEvent.type(departementInput, '1')
        const missionLocaleInput = screen.getByRole('combobox', {
          name: /Recherchez votre Mission locale/,
        })
        await userEvent.selectOptions(missionLocaleInput, 'MLS3F SAINT-LOUIS')

        // When
        const submit = screen.getByRole('button', { name: 'Ajouter' })
        await userEvent.click(submit)

        // Then
        expect(conseillerService.modifierAgence).toHaveBeenCalledWith({
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
        expect(conseillerService.modifierAgence).not.toHaveBeenCalled()
        expect(replace).not.toHaveBeenCalled()
      })
    })
  })

  describe('server side', () => {
    let conseillerService: ConseillerService
    let referentielService: ReferentielService
    it('nécessite une session valide', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: 'whatever',
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: 'whatever' })
    })

    describe('si le conseiller a renseigné son agence', () => {
      beforeEach(() => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: '1' },
            accessToken: 'accessToken',
          },
        })

        const conseillerAvecAgence = {
          ...unConseiller(),
          agence: 'MLS3F SAINT-LOUIS',
        }
        conseillerService = mockedConseillerService({
          getConseillerServerSide: jest.fn(async () => conseillerAvecAgence),
        })
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'conseillerService') return conseillerService
        })
      })

      it('redirige vers la liste des jeunes', async () => {
        // When
        const actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)

        //Then
        expect(actual).toEqual({
          redirect: { destination: '/mes-jeunes', permanent: false },
        })
      })

      it('redirige vers l’url renseignée', async () => {
        // When
        const actual = await getServerSideProps({
          query: { redirectUrl: '/mes-rendezvous' },
        } as unknown as GetServerSidePropsContext)

        //Then
        expect(actual).toEqual({
          redirect: { destination: '/mes-rendezvous', permanent: false },
        })
      })
    })

    describe('si le conseiller n’a pas renseigné son agence', () => {
      beforeEach(() => {
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: '1', structure: StructureConseiller.MILO },
            accessToken: 'accessToken',
          },
        })

        const conseiller = unConseiller()

        conseillerService = mockedConseillerService({
          getConseillerServerSide: jest.fn(async () => conseiller),
        })

        referentielService = {
          getAgences: jest.fn(async () => uneListeDAgencesMILO()),
          getCommunesEtDepartements: jest.fn(),
          getCommunes: jest.fn(),
          getActionsPredefinies: jest.fn(),
          getMetiers: jest.fn(),
        }
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'conseillerService') return conseillerService
          if (dependance === 'referentielService') return referentielService
        })
      })
      it('renvoie les props nécessaires pour demander l’agence', async () => {
        // When
        const actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            redirectUrl: '/mes-jeunes',
            referentielAgences: uneListeDAgencesMILO(),
          },
        })
      })
      it('renvoie l’url renseignée', async () => {
        // When
        const actual = await getServerSideProps({
          query: { redirectUrl: '/mes-rendezvous' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            redirectUrl: '/mes-rendezvous',
            referentielAgences: uneListeDAgencesMILO(),
          },
        })
      })
    })
  })
})
