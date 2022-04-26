import { screen } from '@testing-library/react'
import { GetServerSidePropsContext } from 'next/types'

import renderWithSession from '../renderWithSession'

import { unConseiller } from 'fixtures/conseiller'
import { mockedConseillerService } from 'fixtures/services'
import Home, { getServerSideProps } from 'pages/index'
import { ConseillerService } from 'services/conseiller.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('components/Modal', () => jest.fn(({ children }) => <>{children}</>))

describe('Home', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('client side', () => {
    describe('contenu', () => {
      describe('si le conseiller n’a pas renseigné son agence', () => {
        let conseillerService: ConseillerService

        it('affiche une modale', async () => {
          // Given
          conseillerService = mockedConseillerService({
            getConseiller: jest.fn(async () => Promise.resolve(unConseiller())),
          })

          renderWithSession(
            <DIProvider dependances={{ conseillerService }}>
              <Home conseiller={unConseiller()} />
            </DIProvider>
          )

          // Then
          expect(
            screen.getByText(
              'Afin d’améliorer la qualité du service, nous avons besoin de connaître votre agence de rattachement.'
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
          user: { id: '1' },
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
        props: { conseiller: unConseiller() },
      })
    })

    describe('si le conseiller a renseigné son agence', () => {
      it('redirige vers la liste des jeunes', async () => {
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

        // When
        const actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)

        //Then
        expect(actual).toEqual({
          redirect: { destination: '/mes-jeunes', permanent: true },
        })
      })
    })
  })
})
