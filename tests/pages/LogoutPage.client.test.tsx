import { render } from '@testing-library/react'
import { signOut } from 'next-auth/react'
import React from 'react'

import LogoutPage from 'app/logout/LogoutPage'
import { signOut as chatSignOut } from 'services/messages.service'

jest.mock('services/messages.service', () => ({
  signOut: jest.fn(async () => {}),
}))
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}))

describe('LogoutPage client side', () => {
  beforeEach(() => {
    // Given
    render(<LogoutPage />)
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
