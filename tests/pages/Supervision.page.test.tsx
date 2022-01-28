import { screen } from '@testing-library/react'
import { UserStructure } from 'interfaces/conseiller'
import { GetServerSidePropsContext } from 'next/types'
import Supervision, { getServerSideProps } from 'pages/supervision'
import React from 'react'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import renderWithSession from '../renderWithSession'

jest.mock('utils/withMandatorySessionOrRedirect')

afterAll(() => {
  jest.clearAllMocks()
})

describe('Supervision', () => {
  describe('quand le conseiller est superviseur', () => {
    it('affiche le titre de la page', () => {
      // When
      renderWithSession(<Supervision />, {
        user: {
          id: '1',
          name: 'Nils Tavernier',
          structure: UserStructure.POLE_EMPLOI,
          estSuperviseur: true,
        },
      })

      //THEN
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Transfert de portefeuille'
      )
    })
  })

  describe("quand le conseiller n'est pas superviseur", () => {
    it('renvoie une page 404', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        session: {
          user: { estSuperviseur: false },
        },
        hasSession: true,
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ notFound: true })
    })
  })
})
