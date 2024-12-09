import { render } from '@testing-library/react'

import LogoutPage from 'app/(connexion)/logout/LogoutPage'
import Logout from 'app/(connexion)/logout/page'
import { getSessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({ getSessionServerSide: jest.fn() }))
jest.mock('app/(connexion)/logout/LogoutPage')

describe('LogoutPage server side', () => {
  describe('cej', () => {
    it('prepare la page', async () => {
      // Given
      ;(getSessionServerSide as jest.Mock).mockReturnValue({
        user: { structure: 'MILO' },
      })

      // When
      render(await Logout())

      // Then
      expect(LogoutPage).toHaveBeenCalledWith({ callbackUrl: '/login/cej' }, undefined)
    })
  })

  describe('passemploi', () => {
    it('prepare la page', async () => {
      // Given
      ;(getSessionServerSide as jest.Mock).mockReturnValue({
        user: { structure: 'POLE_EMPLOI_AIJ' },
      })

      // When
      render(await Logout())

      // Then
      expect(LogoutPage).toHaveBeenCalledWith(
        { callbackUrl: '/login/passemploi' },
        undefined
      )
    })
  })
})
