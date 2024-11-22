import { render } from '@testing-library/react'
import { getServerSession } from 'next-auth'

import LogoutPage from 'app/(connexion)/logout/LogoutPage'
import Logout from 'app/(connexion)/logout/page'
import { unUtilisateur } from 'fixtures/auth'

jest.mock('app/(connexion)/logout/LogoutPage')

describe('LogoutPage server side', () => {
  describe('cej', () => {
    it('prepare la page', async () => {
      // Given
      ;(getServerSession as jest.Mock).mockReturnValue({
        user: unUtilisateur({
          structure: 'MILO',
        }),
      })

      // When
      render(await Logout())

      // Then
      expect(LogoutPage).toHaveBeenCalledWith({ callbackUrl: '/login/cej' }, {})
    })
  })

  describe('passemploi', () => {
    it('prepare la page', async () => {
      // Given
      ;(getServerSession as jest.Mock).mockReturnValue({
        user: unUtilisateur({
          structure: 'POLE_EMPLOI_AIJ',
        }),
      })

      // When
      render(await Logout())

      // Then
      expect(LogoutPage).toHaveBeenCalledWith(
        { callbackUrl: '/login/passemploi' },
        {}
      )
    })
  })
})
