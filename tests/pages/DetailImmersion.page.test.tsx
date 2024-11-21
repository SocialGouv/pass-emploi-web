import { act, screen, within } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import React from 'react'

import OffrePage from 'app/(connected)/(with-sidebar)/(with-chat)/offres/[typeOffre]/[idOffre]/OffrePage'
import { unDetailImmersion } from 'fixtures/offre'
import { DetailImmersion } from 'interfaces/offre'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('components/PageActionsPortal')

describe('OffrePage client side - Immersion', () => {
  let container: HTMLElement
  let offre: DetailImmersion

  beforeEach(async () => {
    // Given
    offre = unDetailImmersion()

    // When
    await act(async () => {
      ;({ container } = renderWithContexts(<OffrePage offre={offre} />))
    })
  })

  it('a11y', async () => {
    let results: AxeResults

    await act(async () => {
      results = await axe(container)
    })

    expect(results!).toHaveNoViolations()
  })

  it("permet de partager l'offre", () => {
    // Then
    expect(
      screen.getByRole('link', { name: `Partager offre ${offre.titre}` })
    ).toHaveAttribute('href', `/offres/immersion/${offre.id}/partage`)
  })

  it('affiche le titre de l’offre', () => {
    // Then
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: offre.titre,
      })
    ).toBeInTheDocument()
  })

  it("affiche les informations principales de l'offre", () => {
    const section = screen.getByRole('region', {
      name: "Informations de l'offre",
    })
    expect(
      within(section).getByRole('heading', { level: 3 })
    ).toHaveAccessibleName("Informations de l'offre")

    expect(getByDescriptionTerm('Établissement', section)).toHaveTextContent(
      offre.nomEtablissement
    )
    expect(
      getByDescriptionTerm('Secteur d’activité', section)
    ).toHaveTextContent(offre.secteurActivite)
    expect(getByDescriptionTerm('Ville', section)).toHaveTextContent(
      offre.ville
    )
    expect(
      within(section).getByText(/Prévenez votre conseiller/)
    ).toBeInTheDocument()
  })

  it("affiche le contact pour l'offre", () => {
    const section = screen.getByRole('region', {
      name: 'Informations du Contact',
    })
    expect(
      within(section).getByRole('heading', { level: 3 })
    ).toHaveAccessibleName('Informations du Contact')

    const { contact } = offre

    expect(getByDescriptionTerm('Adresse', section)).toHaveTextContent(
      contact.adresse!
    )
  })
})
