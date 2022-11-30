import { screen } from '@testing-library/dom'
import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import React from 'react'

import Sidebar from 'components/layouts/Sidebar'
import { unConseiller } from 'fixtures/conseiller'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import renderWithContexts from 'tests/renderWithContexts'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'

describe('<Sidebar/>', () => {
  let routerPush: Function
  beforeEach(() => {
    routerPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      pathname: '',
      push: routerPush,
    })
  })

  it('affiche les liens de la barre de navigation', () => {
    // WHEN
    renderSidebar()

    // THEN
    const navigation = screen.getByRole('navigation')
    expect(
      within(navigation).getByRole('link', { name: 'Portefeuille' })
    ).toHaveAttribute('href', '/mes-jeunes')
    expect(
      within(navigation).getByRole('link', { name: 'Agenda' })
    ).toHaveAttribute('href', '/agenda')
    expect(
      within(navigation).getByRole('link', { name: 'Offres' })
    ).toHaveAttribute('href', '/recherche-offres')
    expect(within(navigation).getByLabelText(/Aide/)).toBeInTheDocument()
    expect(
      within(navigation).getByRole('link', { name: 'Nils Tavernier' })
    ).toHaveAttribute('href', '/profil')
    expect(() => within(navigation).getByText('Réaffectation')).toThrow()
  })

  it('permet la deconnexion', async () => {
    // Given
    renderSidebar()

    // When
    await userEvent.click(screen.getByRole('button', { name: 'Déconnexion' }))

    // Then
    expect(routerPush).toHaveBeenCalledWith('/api/auth/federated-logout')
  })

  it("n'affiche pas le lien de rendez-vous lorsque le conseiller n'est pas MILO", () => {
    // WHEN
    renderSidebar({ structure: StructureConseiller.POLE_EMPLOI })

    // THEN
    expect(() => screen.getByText('Rendez-vous')).toThrow()
  })

  it('affiche le lien de réaffectation des jeunes lorsque le conseiller est superviseur', () => {
    // WHEN
    renderSidebar({ estSuperviseur: true })

    // THEN
    expect(screen.getByRole('link', { name: 'Réaffectation' })).toHaveAttribute(
      'href',
      '/reaffectation'
    )
  })
})

function renderSidebar(conseiller?: Partial<Conseiller>) {
  return renderWithContexts(
    <ConseillerProvider conseiller={unConseiller({ ...conseiller })}>
      <Sidebar />
    </ConseillerProvider>
  )
}
