import { GetServerSidePropsContext } from 'next/types'
import { getServerSideProps } from 'pages/index'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Home', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('server side', () => {
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
      it('redirige vers la liste des jeunes', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { source: 'email' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          redirect: {
            destination: '/mes-jeunes?source=email',
            permanent: true,
          },
        })
      })
    })

    describe("si le conseiller n'a pas renseigné son agence", () => {
      it("affiche les info nécessaires pour renseigner l'agence", async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { source: 'email' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({ props: { referentiel: [] } })
      })
    })
  })
})
