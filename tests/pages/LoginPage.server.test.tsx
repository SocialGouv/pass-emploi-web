import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import Login, { metadata } from 'app/login/page'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('next/navigation')
jest.mock(
  'app/login/LoginPage',
  () =>
    function FakePake(props: { [prop: string]: any }) {
      return (
        <>
          {Object.entries(props).map(([prop, value]) => (
            <div key={prop}>
              {prop}: {value.toString()}
            </div>
          ))}
        </>
      )
    }
)

describe('LoginPage server side', () => {
  it('redirige si l’utilisateur est déjà connecté', async () => {
    // Given
    ;(getServerSession as jest.Mock).mockResolvedValue({})

    // When
    await Login({ searchParams: { redirectUrl: 'vers-linfini-et-au-dela' } })

    // Then
    expect(redirect).toHaveBeenCalledWith('vers-linfini-et-au-dela')
  })

  it('prépare la page de login sinon', async () => {
    // Then
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    // When
    render(await Login({ searchParams: { source: 'notif-mail' } }))

    // Then
    expect(metadata).toEqual({ title: 'Connexion' })
    expect(
      screen.getByText('ssoPoleEmploiBRSAEstActif: true')
    ).toBeInTheDocument()
    expect(screen.getByText('ssoPassEmploiEstActif: true')).toBeInTheDocument()
    expect(screen.getByText('isFromEmail: true')).toBeInTheDocument()
  })
})
