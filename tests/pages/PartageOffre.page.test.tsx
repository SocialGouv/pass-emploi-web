import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { GetServerSidePropsContext } from 'next/types'
import { getServerSideProps } from 'pages/offres/[offre_id]/partage'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Page Partage Offre', () => {
  describe('server side', () => {
    it('requiert la connexion', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: { destination: 'whatever' },
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: { destination: 'whatever' } })
    })

    it('charge la page avec les détails de l’offre', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        props: {
          pageTitle: 'Partager une offre',
          offre: { id: 'offre-prof', titre: 'prof' },
        },
      })
    })
  })

  describe('client side', () => {})
})
