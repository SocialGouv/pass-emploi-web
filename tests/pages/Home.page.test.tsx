import { act, fireEvent, screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'

import renderWithSession from '../renderWithSession'

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
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('components/Modal')
jest.mock('next/router', () => ({ useRouter: jest.fn() }))

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
            <Home
              structureConseiller={UserStructure.POLE_EMPLOI}
              referentielAgences={agences}
              redirectUrl='/mes-jeunes'
            />
          </DIProvider>
        )
      })

      it("contient un message pour demander l'agence du conseiller", () => {
        // Then
        expect(screen.getByText(/agence de rattachement/)).toBeInTheDocument()
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

      it('contient un bouton pour annuler', async () => {
        // Given
        const annuler = screen.getByRole('button', { name: 'Annuler' })

        // When
        await act(async () => {
          annuler.click()
        })

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
        fireEvent.input(searchAgence, { target: { value: agence.nom } })
        await act(async () => {
          submit.click()
        })

        // Then
        expect(conseillerService.modifierAgence).toHaveBeenCalledWith(
          '1',
          agence.id,
          'accessToken'
        )
        expect(replace).toHaveBeenCalledWith('/mes-jeunes?choixAgence=succes')
      })
    })

    describe('quand le conseiller est Mission locale', () => {
      it('adapte les textes', () => {
        // Given
        renderWithSession(
          <DIProvider
            dependances={{ conseillerService: mockedConseillerService() }}
          >
            <Home
              structureConseiller={UserStructure.MILO}
              referentielAgences={[]}
              redirectUrl='/mes-jeunes'
            />
          </DIProvider>
        )

        // Then
        expect(
          screen.getByText(/Mission locale de rattachement/)
        ).toBeInTheDocument()
        expect(
          screen.getByRole('combobox', { name: /votre Mission locale/ })
        ).toBeInTheDocument()
      })
    })
  })

  describe('server side', () => {
    let conseillerService: ConseillerService
    let agencesService: AgencesService
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
          agence: { id: '443', nom: 'MLS3F SAINT-LOUIS' },
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
          redirect: { destination: '/mes-jeunes', permanent: true },
        })
      })
      it('redirige vers l’url renseignée', async () => {
        // When
        const actual = await getServerSideProps({
          query: { redirectUrl: '/mes-rendezvous' },
        } as unknown as GetServerSidePropsContext)

        //Then
        expect(actual).toEqual({
          redirect: { destination: '/mes-rendezvous', permanent: true },
        })
      })
    })

    describe('si le conseiller n’a pas renseigné son agence', () => {
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
      it('renvoie les props nécessaires pour demander l’agence', async () => {
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
      it('renvoie l’url renseignée', async () => {
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
