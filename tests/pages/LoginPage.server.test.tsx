import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import LoginPage from 'app/(connexion)/login/LoginPage'
import Login, { metadata } from 'app/(connexion)/login/page'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('app/(connexion)/login/LoginPage')

describe('LoginPage server side', () => {
  it('redirige si l’utilisateur est déjà connecté', async () => {
    // Given
    ;(getServerSession as jest.Mock).mockResolvedValue({})

    // When
    const promise = Login({
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
    render(await Login({ searchParams: { source: 'notif-mail' } }))

    // Then
    expect(metadata).toEqual({
      title: "Connexion dans l'espace conseiller CEJ",
    })
    expect(LoginPage).toHaveBeenCalledWith(
      {
        isFromEmail: true,
        ssoFranceTravailBRSAEstActif: true,
        ssoFranceTravailAIJEstActif: true,
      },
      {}
    )
  })
})
