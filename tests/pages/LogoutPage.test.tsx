import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { signOut } from 'next-auth/react'
import React from 'react'

import LogoutPage from 'app/(connexion)/logout/LogoutPage'
import { signOut as chatSignOut } from 'services/messages.service'
expect.extend(toHaveNoViolations)

jest.mock('services/messages.service', () => ({
  signOut: jest.fn(async () => {}),
}))
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}))

describe('LogoutPage client side', () => {
  let container: HTMLElement

  beforeEach(() => {
    // Given
    ;({ container } = render(<LogoutPage />))
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
      callbackUrl: '/login',
      redirect: true,
    })
  })
})
