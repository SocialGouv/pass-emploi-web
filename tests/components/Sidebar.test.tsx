import { screen } from '@testing-library/dom'
import { within } from '@testing-library/react'
import { useRouter } from 'next/router'
import React from 'react'

import renderWithSession from '../renderWithSession'

import Sidebar from 'components/layouts/Sidebar'
import { StructureConseiller } from 'interfaces/conseiller'

describe('<Sidebar/>', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ pathname: '' })
  })

  it('affiche les liens de la barre de navigation', () => {
    // WHEN
    renderWithSession(<Sidebar />)

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
    expect(() => within(navigation).getByText('Réaffectation')).toThrow()
  })

  it('affiche le lien de déconnexion', () => {
    // WHEN
    renderWithSession(<Sidebar />)

    // THEN
    expect(
      screen.getByRole('link', { name: 'Déconnexion' })
    ).toBeInTheDocument()
  })

  it("n'affiche pas le lien de rendez-vous lorsque le conseiller n'est pas MILO", () => {
    // WHEN
    renderWithSession(<Sidebar />, {
      user: {
        id: '1',
        name: 'Nils Tavernier',
        structure: StructureConseiller.POLE_EMPLOI,
        estSuperviseur: false,
        email: 'fake@email.com',
        estConseiller: true,
      },
    })

    // THEN
    expect(() => screen.getByText('Rendez-vous')).toThrow()
  })

  it('affiche le lien de réaffectation des jeunes lorsque le conseiller est superviseur', () => {
    // WHEN
    renderWithSession(<Sidebar />, {
      user: {
        id: '1',
        name: 'Nils Tavernier',
        structure: StructureConseiller.MILO,
        estSuperviseur: true,
        email: 'fake@email.com',
        estConseiller: true,
      },
    })

    // THEN
    expect(screen.getByRole('link', { name: 'Réaffectation' })).toHaveAttribute(
      'href',
      '/reaffectation'
    )
  })
})
