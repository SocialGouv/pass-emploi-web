import React from 'react'
import { RenderResult } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import Sidebar from 'components/layouts/Sidebar'
import renderWithSession from '../renderWithSession'
import { UserStructure } from 'interfaces/conseiller'

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

  it('affiche les liens de la barre de navigation', () => {
    // GIVEN
    component = renderWithSession(<Sidebar />)

    // WHEN

    // THEN
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('Rendez-vous')).toBeInTheDocument()
    expect(screen.getByText('Mes jeunes')).toBeInTheDocument()
    expect(screen.getByText('Aide')).toBeInTheDocument()
    expect(() => screen.getByText('Supervision')).toThrow()
  })

  it('affiche le lien de déconnexion', () => {
    // GIVEN
    component = renderWithSession(<Sidebar />)

    // WHEN

    // THEN
    expect(
      screen.getByRole('link', {
        name: 'Se déconnecter',
      })
    ).toBeInTheDocument()
  })

  it("n'affiche pas le lien de rendez-vous lorsque le conseiller n'est pas MILO", () => {
    // GIVEN
    component = renderWithSession(<Sidebar />, {
      user: {
        id: '1',
        name: 'Nils Tavernier',
        structure: UserStructure.POLE_EMPLOI,
        estSuperviseur: false,
      },
    })

    // WHEN

    // THEN
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(() => screen.getByText('Rendez-vous')).toThrow()
    expect(screen.getByText('Mes jeunes')).toBeInTheDocument()
    expect(screen.getByText('Aide')).toBeInTheDocument()
  })

  it('affiche le lien de supervision lorsque le conseiller est superviseur', () => {
    // GIVEN
    component = renderWithSession(<Sidebar />, {
      user: {
        id: '1',
        name: 'Nils Tavernier',
        structure: UserStructure.MILO,
        estSuperviseur: true,
      },
    })

    // WHEN

    // THEN
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('Rendez-vous')).toBeInTheDocument()
    expect(screen.getByText('Mes jeunes')).toBeInTheDocument()
    expect(screen.getByText('Aide')).toBeInTheDocument()
    expect(screen.getByText('Supervision')).toBeInTheDocument()
  })
})
