import React from 'react'
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
  it('affiche les liens de la barre de navigation', () => {
    // WHEN
    renderWithSession(<Sidebar />)

    // THEN
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('Rendez-vous')).toBeInTheDocument()
    expect(screen.getByText('Mes jeunes')).toBeInTheDocument()
    expect(screen.getByText('Aide')).toBeInTheDocument()
    expect(() => screen.getByText('Supervision')).toThrow()
  })

  it('affiche le lien de déconnexion', () => {
    // WHEN
    renderWithSession(<Sidebar />)

    // THEN
    expect(
      screen.getByRole('link', {
        name: 'Se déconnecter',
      })
    ).toBeInTheDocument()
  })

  it("n'affiche pas le lien de rendez-vous lorsque le conseiller n'est pas MILO", () => {
    // WHEN
    renderWithSession(<Sidebar />, {
      user: {
        id: '1',
        name: 'Nils Tavernier',
        structure: UserStructure.POLE_EMPLOI,
        estSuperviseur: false,
        email: 'fake@email.com',
        estConseiller: true,
      },
    })

    // THEN
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(() => screen.getByText('Rendez-vous')).toThrow()
    expect(screen.getByText('Mes jeunes')).toBeInTheDocument()
    expect(screen.getByText('Aide')).toBeInTheDocument()
  })

  it('affiche le lien de supervision lorsque le conseiller est superviseur', () => {
    // WHEN
    renderWithSession(<Sidebar />, {
      user: {
        id: '1',
        name: 'Nils Tavernier',
        structure: UserStructure.MILO,
        estSuperviseur: true,
        email: 'fake@email.com',
        estConseiller: true,
      },
    })

    // THEN
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('Rendez-vous')).toBeInTheDocument()
    expect(screen.getByText('Mes jeunes')).toBeInTheDocument()
    expect(screen.getByText('Aide')).toBeInTheDocument()
    expect(screen.getByText('Supervision')).toBeInTheDocument()
  })
})
