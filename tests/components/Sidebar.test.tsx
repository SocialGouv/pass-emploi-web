import { screen } from '@testing-library/dom'
import { within } from '@testing-library/react'
import React from 'react'

import renderWithSession from '../renderWithSession'

import Sidebar from 'components/layouts/Sidebar'
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
    renderWithSession(<Sidebar/>)

    // THEN
    const navigation = screen.getByRole('navigation')
    expect(
      within(navigation).getByRole('link', { name: 'Rendez-vous' })
    ).toHaveAttribute('href', '/mes-rendezvous')
    expect(
      within(navigation).getByRole('link', { name: 'Mes jeunes' })
    ).toHaveAttribute('href', '/mes-jeunes')
    expect(within(navigation).getByLabelText(/Aide/)).toBeInTheDocument()
    expect(
      within(navigation).getByRole('link', { name: 'Nils Tavernier' })
    ).toHaveAttribute('href', '/profil')
    expect(() => within(navigation).getByText('Supervision')).toThrow()
  })

  it('affiche le lien de déconnexion', () => {
    // WHEN
    renderWithSession(<Sidebar/>)

    // THEN
    expect(
      screen.getByRole('link', { name: 'Déconnexion' })
    ).toBeInTheDocument()
  })

  it("n'affiche pas le lien de rendez-vous lorsque le conseiller n'est pas MILO", () => {
    // WHEN
    renderWithSession(<Sidebar/>, {
      user: {
        id: '1',
        name: 'Nils Tavernier',
        structure: UserStructure.POLE_EMPLOI,
        estSuperviseur: false,
        email: 'fake@email.com',
        estConseiller: true
      }
    })

    // THEN
    expect(() => screen.getByText('Rendez-vous')).toThrow()
  })

  it('affiche le lien de supervision lorsque le conseiller est superviseur', () => {
    // WHEN
    renderWithSession(<Sidebar/>, {
      user: {
        id: '1',
        name: 'Nils Tavernier',
        structure: UserStructure.MILO,
        estSuperviseur: true,
        email: 'fake@email.com',
        estConseiller: true
      }
    })

    // THEN
    expect(screen.getByRole('link', { name: 'Supervision' })).toHaveAttribute(
      'href',
      '/supervision'
    )
  })
})
