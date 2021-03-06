import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import {
  uneListeDAgencesMILO,
  uneListeDAgencesPoleEmploi,
} from 'fixtures/agence'
import { unConseiller } from 'fixtures/conseiller'
import { mockedConseillerService } from 'fixtures/services'
import { Agence, UserStructure } from 'interfaces/conseiller'
import Home, { getServerSideProps } from 'pages/index'
import { AgencesService } from 'services/agences.service'
import { ConseillerService } from 'services/conseiller.service'
import renderWithSession from 'tests/renderWithSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('components/Modal')

describe('Home', () => {
  describe('client side', () => {
    describe('contenu', () => {
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
        renderWithSession(
          <DIProvider dependances={{ conseillerService }}>
            <ConseillerProvider conseiller={unConseiller()}>
              <Home
                structureConseiller={UserStructure.POLE_EMPLOI}
                referentielAgences={agences}
                redirectUrl='/mes-jeunes'
              />
            </ConseillerProvider>
          </DIProvider>
        )
      })

      it("contient un message pour demander l'agence du conseiller", () => {
        // Then
        expect(
          screen.getByText(/La liste des agences a ??t?? mise ?? jour/)
        ).toBeInTheDocument()
        expect(
          screen.getByText(/Une fois votre agence renseign??e/)
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
          screen.getByRole('checkbox', { name: /Mon agence n???appara??t pas/ })
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
        expect(conseillerService.modifierAgence).toHaveBeenCalledWith(
          '1',
          { id: agence.id, nom: 'Agence P??le emploi THIERS' },
          'accessToken'
        )
        expect(replace).toHaveBeenCalledWith('/mes-jeunes?choixAgence=succes')
      })

      it("pr??vient si l'agence n'est pas renseign??e", async () => {
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
          screen.getByText('S??lectionner une agence dans la liste')
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
            name: /n???appara??t pas/,
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
          expect(conseillerService.modifierAgence).toHaveBeenCalledWith(
            '1',
            { nom: 'Agence libre' },
            'accessToken'
          )
        })

        it('bloque la s??lection dans la liste', () => {
          // Then
          expect(searchAgence.value).toEqual('')
          expect(searchAgence).toHaveAttribute('disabled', '')
        })

        it("pr??vient si l'agence n'est pas renseign??e", async () => {
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
      it("affiche 'Mission locale' au lieu de 'agence'", async () => {
        // Given
        renderWithSession(
          <DIProvider
            dependances={{ conseillerService: mockedConseillerService() }}
          >
            <ConseillerProvider conseiller={unConseiller()}>
              <Home
                structureConseiller={UserStructure.MILO}
                referentielAgences={[]}
                redirectUrl='/mes-jeunes'
              />
            </ConseillerProvider>
          </DIProvider>
        )
        const searchMission = screen.getByRole('combobox', {
          name: /votre Mission locale/,
        })
        const submit = screen.getByRole('button', { name: 'Ajouter' })

        // When
        await userEvent.type(searchMission, 'pouet')
        await userEvent.click(submit)

        // Then
        expect(
          screen.getByText(/La liste des Missions locales a ??t?? mise ?? jour/)
        ).toBeInTheDocument()
        expect(
          screen.getByText(/Une fois votre Mission locale renseign??e/)
        ).toBeInTheDocument()
        expect(
          screen.getByText(/S??lectionner une Mission locale/)
        ).toBeInTheDocument()

        // When
        const checkAgenceNonTrouvee = screen.getByRole('checkbox', {
          name: /Ma Mission locale n???appara??t pas/,
        })
        await userEvent.click(checkAgenceNonTrouvee)

        // Then
        expect(
          screen.getByRole('textbox', {
            name: /Saisir le nom de votre Mission locale/,
          })
        ).toBeInTheDocument()
      })
    })
  })

  describe('server side', () => {
    let conseillerService: ConseillerService
    let agencesService: AgencesService
    it('n??cessite une session valide', async () => {
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

    describe('si le conseiller a renseign?? son agence', () => {
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
          getConseiller: jest.fn(async () => conseillerAvecAgence),
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
      it('redirige vers l???url renseign??e', async () => {
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

    describe('si le conseiller n???a pas renseign?? son agence', () => {
      beforeEach(() => {
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: '1', structure: UserStructure.MILO },
            accessToken: 'accessToken',
          },
        })

        const conseiller = unConseiller()

        conseillerService = mockedConseillerService({
          getConseiller: jest.fn(async () => conseiller),
        })

        agencesService = {
          getAgences: jest.fn(async () => uneListeDAgencesMILO()),
        }
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'conseillerService') return conseillerService
          if (dependance === 'agencesService') return agencesService
        })
      })
      it('renvoie les props n??cessaires pour demander l???agence', async () => {
        // When
        const actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            redirectUrl: '/mes-jeunes',
            structureConseiller: UserStructure.MILO,
            referentielAgences: uneListeDAgencesMILO(),
          },
        })
      })
      it('renvoie l???url renseign??e', async () => {
        // When
        const actual = await getServerSideProps({
          query: { redirectUrl: '/mes-rendezvous' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          props: {
            redirectUrl: '/mes-rendezvous',
            structureConseiller: UserStructure.MILO,
            referentielAgences: uneListeDAgencesMILO(),
          },
        })
      })
    })
  })
})
