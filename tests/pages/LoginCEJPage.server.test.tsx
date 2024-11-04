import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import LoginCEJPage from 'app/(connexion)/login/cej/LoginCEJPage'
import LoginCEJ, { metadata } from 'app/(connexion)/login/cej/page'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('app/(connexion)/login/cej/LoginCEJPage')

describe('LoginCEJPage server side', () => {
  it('redirige si l’utilisateur est déjà connecté', async () => {
    // Given
    ;(getServerSession as jest.Mock).mockResolvedValue({})

    // When
    const promise = LoginCEJ({
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
    render(await LoginCEJ({ searchParams: { source: 'notif-mail' } }))

    // Then
    expect(metadata).toEqual({
      title:
        "Connexion dans l'espace conseiller - Outil du Contrat d’Engagement Jeune",
    })
    expect(LoginCEJPage).toHaveBeenCalledWith({}, {})
  })
})
