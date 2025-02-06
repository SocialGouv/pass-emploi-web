import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import LoginFranceTravailPage from 'app/(connexion)/login/france-travail/LoginFranceTravailPage'
import LoginFranceTravail, {
  metadata,
} from 'app/(connexion)/login/france-travail/page'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('app/(connexion)/login/france-travail/LoginFranceTravailPage')

describe('LoginFranceTravailPage server side', () => {
  it('redirige si l’utilisateur est déjà connecté', async () => {
    // Given
    ;(getServerSession as jest.Mock).mockResolvedValue({})

    // When
    const promise = LoginFranceTravail({
      searchParams: Promise.resolve({ redirectUrl: 'vers-linfini-et-au-dela' }),
    })

    // Then
    await expect(promise).rejects.toEqual(
      new Error('NEXT_REDIRECT vers-linfini-et-au-dela')
    )
    expect(redirect).toHaveBeenCalledWith('vers-linfini-et-au-dela')
  })

  it('prépare la page de login sinon', async () => {
    // Then
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    // When
    render(
      await LoginFranceTravail({
        searchParams: Promise.resolve({ source: 'notif-mail' }),
      })
    )

    // Then
    expect(metadata).toEqual({
      title:
        'Connexion France Travail - Outil du Contrat d’Engagement Jeune et du pass emploi',
    })
    expect(LoginFranceTravailPage).toHaveBeenCalledWith({}, undefined)
  })
})
