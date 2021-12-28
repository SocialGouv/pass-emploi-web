import React from 'react'
import { RenderResult } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import Sidebar from 'components/layouts/Sidebar'
import renderWithSession from '../renderWithSession'
import { DIProvider } from 'utils/injectionDependances'

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null),
    }
  },
}))

describe('<Sidebar/>', () => {
  let component: RenderResult
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('devrait afficher les liens de la barre de navigation', () => {
    // GIVEN
    component = renderWithSession(
      <DIProvider>
        <Sidebar />
      </DIProvider>
    )

    // WHEN

    // THEN
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('Rendez-vous')).toBeInTheDocument()
    expect(screen.getByText('Mes jeunes')).toBeInTheDocument()
    expect(screen.getByText('Aide')).toBeInTheDocument()
  })

  it('devrait afficher le lien de déconnexion', () => {
    // GIVEN
    component = renderWithSession(
      <DIProvider>
        <Sidebar />
      </DIProvider>
    )

    // WHEN

    // THEN
    expect(
      screen.getByRole('link', {
        name: 'Se déconnecter',
      })
    ).toBeInTheDocument()
  })
})
