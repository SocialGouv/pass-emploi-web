import { screen } from '@testing-library/react'
import { GetServerSidePropsContext } from 'next/types'

import renderWithSession from '../renderWithSession'

import { unConseiller } from 'fixtures/conseiller'
import { mockedConseillerService } from 'fixtures/services'
import { Conseiller, UserStructure } from 'interfaces/conseiller'
import Home, { getServerSideProps } from 'pages/index'
import { ConseillerService } from 'services/conseiller.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('components/Modal')

describe('Home', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('client side', () => {
    describe('contenu', () => {
      let conseillerService: ConseillerService
      describe('on affiche une modale', () => {
        let conseiller: Conseiller
        beforeEach(() => {
          conseiller = { ...unConseiller(), agence: { id: '', nom: '' } }
          conseillerService = mockedConseillerService({
            getConseiller: jest.fn(async () => Promise.resolve(conseiller)),
          })
        })

        it('en tant que conseiller Pôle Emploi', () => {
          // Given
          renderWithSession(
            <DIProvider dependances={{ conseillerService }}>
              <Home
                structureConseiller={UserStructure.POLE_EMPLOI}
                redirectUrl='/mes-jeunes'
              />
            </DIProvider>
          )

          // Then
          expect(
            screen.getByText(
              'Afin d’améliorer la qualité du service, nous avons besoin de connaître votre agence de rattachement.'
            )
          ).toBeInTheDocument()
        })

        it('en tant que conseiller Mission locale', () => {
          // Given
          renderWithSession(
            <DIProvider dependances={{ conseillerService }}>
              <Home
                structureConseiller={UserStructure.MILO}
                redirectUrl='/mes-jeunes'
              />
            </DIProvider>
          )

          // Then
          expect(
            screen.getByText(
              'Afin d’améliorer la qualité du service, nous avons besoin de connaître votre Mission locale de rattachement.'
            )
          ).toBeInTheDocument()
        })
      })
    })
  })

  describe('server side', () => {
    let conseillerService: ConseillerService
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

    it('récupère les informations du conseiller', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          user: { id: '1', structure: UserStructure.POLE_EMPLOI },
          accessToken: 'accessToken',
        },
      })

      conseillerService = mockedConseillerService({
        getConseiller: jest.fn(async () => unConseiller()),
      })
      ;(withDependance as jest.Mock).mockImplementation((dependance) => {
        if (dependance === 'conseillerService') return conseillerService
      })

      // When
      const actual = await getServerSideProps({
        query: {},
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(conseillerService.getConseiller).toHaveBeenCalledWith(
        '1',
        'accessToken'
      )

      expect(actual).toMatchObject({
        props: {
          redirectUrl: '/mes-jeunes',
          structureConseiller: UserStructure.POLE_EMPLOI,
        },
      })
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
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'conseillerService') return conseillerService
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
          },
        })
      })
    })
  })
})
