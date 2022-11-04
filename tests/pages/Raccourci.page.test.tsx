import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { getServerSideProps } from 'pages/raccourci'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('next/router')

describe("Page Détail d'une action d'un jeune", () => {
  describe('server-side', () => {
    it('requiert une session valide', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: 'wherever',
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: 'wherever' })
    })

    describe("quand le conseiller n'est pas Pôle emploi", () => {
      it('récupère les props', async () => {
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            accessToken: 'accessToken',
            user: { structure: 'MILO' },
          },
        })

        // When
        const actual: GetServerSidePropsResult<any> = await getServerSideProps(
          {} as GetServerSidePropsContext
        ) // Then
        expect(actual).toEqual({
          props: {
            pageHeader: 'Créer un raccourci',
            pageTitle: 'Tutoriel raccourci mobile',
            withoutChat: true,
            returnTo: '/mes-jeunes',
          },
        })
      })
    })
  })
})
