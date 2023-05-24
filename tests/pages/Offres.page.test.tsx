import { GetServerSidePropsContext } from 'next/types'

import { getServerSideProps } from 'pages/offres'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/analytics/matomo')

describe('Fiche Jeune MiLo', () => {
  describe('server side', () => {
    it("redirige vers la recherche d'offres", async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        redirect: { destination: '/recherche-offres', permanent: false },
      })
    })
  })
})
