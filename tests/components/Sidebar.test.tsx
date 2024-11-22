import { screen } from '@testing-library/dom'
import { act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import Sidebar from 'components/Sidebar'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/conseillers.service')
jest.mock('components/ModalContainer')

describe('<Sidebar/>', () => {
  let routerPush: Function
  beforeEach(() => {
    routerPush = jest.fn()
    ;(usePathname as jest.Mock).mockReturnValue('')
    ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })
  })

  it('affiche les liens de la barre de navigation', async () => {
    // WHEN
    await renderSidebar({ structure: StructureConseiller.MILO })

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
    ).toHaveAttribute('href', '/offres')
    expect(
      within(navigation).getByRole('link', { name: 'Aide et ressources' })
    ).toHaveAttribute('href', '/aide')
    expect(
      within(navigation).getByRole('link', { name: /Nils Tavernier/ })
    ).toHaveAttribute('href', '/profil')
    expect(
      within(navigation).getByRole('link', { name: 'Pilotage' })
    ).toHaveAttribute('href', '/pilotage')
    expect(
      within(navigation).getByRole('link', { name: 'Bénéficiaires' })
    ).toHaveAttribute('href', '/etablissement')
    expect(
      within(navigation).getByRole('button', { name: /Actualités/ })
    ).toBeInTheDocument()
    expect(() => within(navigation).getByText('Réaffectation')).toThrow()
  })

  it('permet la deconnexion', async () => {
    // When
    await renderSidebar()
    await userEvent.click(screen.getByRole('button', { name: 'Déconnexion' }))

    // Then
    expect(routerPush).toHaveBeenCalledWith('/api/auth/federated-logout')
  })

  it('permet de consulter les actualités', async () => {
    // When
    await renderSidebar()
    await userEvent.click(screen.getByRole('button', { name: /Actualités/ }))

    // Then
    expect(
      screen.getByRole('heading', { level: 2, name: 'Actualités' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Invitation à la journée présentiel du 31 octobre 2024',
      })
    ).toBeInTheDocument()
  })

  it('afficher le lien vers la réaffectation quand le conseiller est superviseur', async () => {
    // When
    await renderSidebar({ estSuperviseur: true })

    // Then
    const navigation = screen.getByRole('navigation')
    expect(
      within(navigation).getByRole('link', { name: 'Réaffectation' })
    ).toHaveAttribute('href', '/reaffectation')
  })

  it('affiche un badge si le conseiller n’a pas d’adresse e-mail', async () => {
    //WHEN
    await renderSidebar({ email: undefined })

    //THEN
    expect(
      screen.getByText('Une information en attente de mise à jour')
    ).toBeInTheDocument()
  })

  it("n'affiche pas le lien de l’agenda lorsque le conseiller est France Travail", async () => {
    // WHEN
    await renderSidebar({ structure: StructureConseiller.POLE_EMPLOI })

    // THEN
    expect(() => screen.getByText('Agenda')).toThrow()
  })

  it("n'affiche pas le lien de rendez-vous lorsque le conseiller est France Travail", async () => {
    // WHEN
    await renderSidebar({ structure: StructureConseiller.POLE_EMPLOI })

    // THEN
    expect(() => screen.getByText('Pilotage')).toThrow()
  })

  it("n'affiche pas le lien de Mission Locale lorsque le conseiller est France Travail", async () => {
    // WHEN
    await renderSidebar({ structure: StructureConseiller.POLE_EMPLOI })

    // THEN
    expect(() => screen.getByText('Mission Locale')).toThrow()
  })

  it("n'affiche pas le lien de Messagerie lorsque le conseiller est MILO", async () => {
    // WHEN
    await renderSidebar({ structure: StructureConseiller.MILO })

    // THEN
    expect(() => screen.getByText('Messagerie')).toThrow()
  })

  it('affiche le lien de Messagerie lorsque le conseiller n’est pas MILO (PE, BRSA, Pass emploi)', async () => {
    // WHEN
    await renderSidebar({ structure: StructureConseiller.POLE_EMPLOI })

    // THEN
    const navigation = screen.getByRole('navigation')
    expect(
      within(navigation).getByRole('link', { name: 'Messagerie' })
    ).toHaveAttribute('href', '/messagerie')
  })
})

async function renderSidebar(conseiller?: Partial<Conseiller>) {
  let container: HTMLElement
  ;({ container } = renderWithContexts(<Sidebar />, {
    customConseiller: conseiller,
  }))

  let results: AxeResults
  await act(async () => {
    results = await axe(container)
  })
  expect(results!).toHaveNoViolations()
}
