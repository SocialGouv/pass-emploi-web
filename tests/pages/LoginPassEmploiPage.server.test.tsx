import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import LoginPassEmploiPage from 'app/(connexion)/login/passemploi/LoginPassEmploiPage'
import LoginPassEmploi, {
  metadata,
} from 'app/(connexion)/login/passemploi/page'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('app/(connexion)/login/passemploi/LoginPassEmploiPage')

describe('LoginPassEmploiPage server side', () => {
  it('redirige si l’utilisateur est déjà connecté', async () => {
    // Given
    ;(getServerSession as jest.Mock).mockResolvedValue({})

    // When
    const promise = LoginPassEmploi({
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
    render(await LoginPassEmploi({ searchParams: { source: 'notif-mail' } }))

    // Then
    expect(metadata).toEqual({
      title: "Connexion dans l'espace conseiller - Outil du pass emploi",
    })
    expect(LoginPassEmploiPage).toHaveBeenCalledWith(
      {
        ssoConseillerDeptEstActif: true,
        ssoFranceTravailAIJEstActif: true,
        ssoFranceTravailBRSAEstActif: true,
      },
      {}
    )
  })
})
