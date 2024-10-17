import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { signOut } from 'next-auth/react'
import React from 'react'

import LogoutPage from 'app/(connexion)/logout/LogoutPage'
import { signOut as chatSignOut } from 'services/messages.service'

jest.mock('services/messages.service', () => ({
  signOut: jest.fn(async () => {}),
}))
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}))

describe('LogoutPage client side', () => {
  let container: HTMLElement

  describe('content', () => {
    beforeEach(() => {
      // Given
      ;({ container } = render(<LogoutPage estPassEmploi={undefined} />))
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('déconnecte de la messagerie', async () => {
      // Then
      expect(chatSignOut).toHaveBeenCalledWith()
    })

    it('déconnecte de la session', async () => {
      // Then
      expect(signOut).toHaveBeenCalledWith({
        callbackUrl: '/login/',
        redirect: true,
      })
    })
  })

  describe('quand l’utilisateur est CEJ', () => {
    beforeEach(() => {
      // Given
      ;({ container } = render(<LogoutPage estPassEmploi={false} />))
    })

    it('redirige vers le login CEJ', () => {
      //Then
      expect(signOut).toHaveBeenCalledWith({
        callbackUrl: '/login/cej',
        redirect: true,
      })
    })
  })

  describe('quand l’utilisateur est Pass Emploi', () => {
    beforeEach(() => {
      // Given
      ;({ container } = render(<LogoutPage estPassEmploi={true} />))
    })

    it('redirige vers le login Pass Emploi', () => {
      //Then
      expect(signOut).toHaveBeenCalledWith({
        callbackUrl: '/login/passemploi',
        redirect: true,
      })
    })
  })
})
