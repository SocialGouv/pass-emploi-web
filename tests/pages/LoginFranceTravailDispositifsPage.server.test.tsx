import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import LoginFranceTravailDispositifsPage from 'app/(connexion)/login/france-travail/dispositifs/LoginFranceTravailDispositifsPage'
import LoginFranceTravailDispositifs, {
  metadata,
} from 'app/(connexion)/login/france-travail/dispositifs/page'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock(
  'app/(connexion)/login/france-travail/dispositifs/LoginFranceTravailDispositifsPage'
)

describe('LoginFranceTravailDispositifsPage server side', () => {
  it('redirige si l’utilisateur est déjà connecté', async () => {
    // Given
    ;(getServerSession as jest.Mock).mockResolvedValue({})

    // When
    const promise = LoginFranceTravailDispositifs({
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
      await LoginFranceTravailDispositifs({
        searchParams: Promise.resolve({ source: 'notif-mail' }),
      })
    )

    // Then
    expect(metadata).toEqual({
      title:
        'Sélection du dispositif France Travail - Outil du Contrat d’Engagement Jeune et du pass emploi',
    })
    expect(LoginFranceTravailDispositifsPage).toHaveBeenCalledWith(
      { ssoAvenirProEstActif: true },
      undefined
    )
  })
})
