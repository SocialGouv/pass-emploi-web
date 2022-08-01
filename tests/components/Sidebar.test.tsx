import { screen } from '@testing-library/dom'
import { render, within } from '@testing-library/react'
import { useRouter } from 'next/router'
import React from 'react'

import Sidebar from 'components/layouts/Sidebar'
import { unConseiller } from 'fixtures/conseiller'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'

describe('<Sidebar/>', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ pathname: '' })
  })

  it('affiche les liens de la barre de navigation', () => {
    // WHEN
    renderSidebar()

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
    renderSidebar()

    // THEN
    expect(
      screen.getByRole('link', { name: 'Déconnexion' })
    ).toBeInTheDocument()
  })

  it("n'affiche pas le lien de rendez-vous lorsque le conseiller n'est pas MILO", () => {
    // WHEN
    renderSidebar(unConseiller({ structure: StructureConseiller.POLE_EMPLOI }))

    // THEN
    expect(() => screen.getByText('Rendez-vous')).toThrow()
  })

  it('affiche le lien de réaffectation des jeunes lorsque le conseiller est superviseur', () => {
    // WHEN
    renderSidebar(unConseiller({ estSuperviseur: true }))

    // THEN
    expect(screen.getByRole('link', { name: 'Réaffectation' })).toHaveAttribute(
      'href',
      '/reaffectation'
    )
  })
})

function renderSidebar(conseiller?: Conseiller) {
  return render(
    <ConseillerProvider conseiller={conseiller ?? unConseiller()}>
      <Sidebar />
    </ConseillerProvider>
  )
}
