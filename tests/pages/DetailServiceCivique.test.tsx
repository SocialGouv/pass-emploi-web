import { act, screen, within } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import React from 'react'

import OffrePage from 'app/(connected)/(with-sidebar)/(with-chat)/offres/[typeOffre]/[idOffre]/OffrePage'
import { unDetailServiceCivique } from 'fixtures/offre'
import { DetailServiceCivique } from 'interfaces/offre'
import getByDescriptionTerm, { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
expect.extend(toHaveNoViolations)

jest.mock('components/PageActionsPortal')

describe('OffrePage client side - Service civique', () => {
  let container: HTMLElement
  let offre: DetailServiceCivique

  beforeEach(async () => {
    // Given
    offre = unDetailServiceCivique()

    // When
    await act(async () => {
      ;({ container } = renderWithContexts(<OffrePage offre={offre} />))
    })
  })

  it('a11y', async () => {
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('permet de partager le service civique', () => {
    // Then
    expect(
      screen.getByRole('link', {
        name: `Partager offre ${offre.titre}`,
      })
    ).toHaveAttribute('href', `/offres/service-civique/${offre.id}/partage`)
  })

  it("affiche les informations principales de l'offre", () => {
    const section = screen.getByRole('region', {
      name: 'Informations du service civique',
    })
    expect(
      within(section).getByRole('heading', { level: 3 })
    ).toHaveAccessibleName('Informations du service civique')

    expect(getByTextContent('Domaine : ' + offre.domaine)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: offre.titre,
      })
    ).toBeInTheDocument()
    expect(getByDescriptionTerm('Organisation', section)).toHaveTextContent(
      offre.organisation!
    )
    expect(getByDescriptionTerm('Localisation', section)).toHaveTextContent(
      offre.codeDepartement!
    )
    expect(getByDescriptionTerm('Date de début', section)).toHaveTextContent(
      'Commence le 17/02/2022'
    )
    expect(getByDescriptionTerm('Date de fin', section)).toHaveTextContent(
      'Termine le 17/07/2022'
    )
  })

  it('affiche le détail de la mission', () => {
    const section = screen.getByRole('region', {
      name: 'Mission',
    })
    expect(section).toBeInTheDocument()
    expect(
      within(section).getByRole('heading', { level: 3 })
    ).toHaveAccessibleName('Mission')

    expect(getByDescriptionTerm('Adresse', section)).toHaveTextContent(
      `${offre.adresseMission!}, ${offre.codePostal} ${offre.ville}`
    )
    expect(getByDescriptionTerm('Description', section)).toHaveTextContent(
      offre.description!
    )
    expect(
      within(getByDescriptionTerm('Lien offre', section)).getByRole('link', {
        name: 'Voir l’offre détaillée (nouvelle fenêtre)',
      })
    ).toHaveAttribute('href', offre.lienAnnonce)
  })

  it('affiche le détail de l’organisation', () => {
    const section = screen.getByRole('region', {
      name: 'Organisation',
    })
    expect(section).toBeInTheDocument()
    expect(
      within(section).getByRole('heading', { level: 3 })
    ).toHaveAccessibleName('Organisation')

    expect(getByDescriptionTerm('Nom', section)).toHaveTextContent(
      offre.organisation!
    )
    expect(
      within(getByDescriptionTerm('Lien organisation', section)).getByRole(
        'link',
        { name: 'Site de l’entreprise (nouvelle fenêtre)' }
      )
    ).toHaveAttribute('href', offre.urlOrganisation)
    expect(getByDescriptionTerm('Adresse', section)).toHaveTextContent(
      offre.adresseOrganisation!
    )
    expect(getByDescriptionTerm('Description', section)).toHaveTextContent(
      offre.descriptionOrganisation!
    )
  })
})
