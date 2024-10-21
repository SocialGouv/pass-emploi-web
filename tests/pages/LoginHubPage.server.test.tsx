import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import LoginHubPage from 'app/(connexion)/login/LoginHubPage'
import LoginHub, { metadata } from 'app/(connexion)/login/page'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('app/(connexion)/login/LoginHubPage')

describe('LoginPage server side', () => {
  it('redirige si l’utilisateur est déjà connecté', async () => {
    // Given
    ;(getServerSession as jest.Mock).mockResolvedValue({})

    // When
    const promise = LoginHub({
      searchParams: { redirectUrl: 'vers-linfini-et-au-dela' },
    })

    // Then
    await expect(promise).rejects.toEqual(
      new Error('NEXT REDIRECT vers-linfini-et-au-dela')
    )
    expect(redirect).toHaveBeenCalledWith('vers-linfini-et-au-dela')
  })

  it('prépare la page de login sinon', async () => {
    // Then
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    // When
    render(await LoginHub({ searchParams: { source: 'notif-mail' } }))

    // Then
    expect(metadata).toEqual({
      title: 'Sélection de l’espace de connexion',
    })
    expect(LoginHubPage).toHaveBeenCalledWith({}, {})
  })
})
