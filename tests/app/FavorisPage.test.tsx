import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import React from 'react'

import FavorisPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/favoris/FavorisPage'
import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import renderWithContexts from 'tests/renderWithContexts'

describe('FavorisPage client side', () => {
  let container: HTMLElement

  const offres = uneListeDOffres()
  const recherches = uneListeDeRecherches()

  beforeEach(async () => {
    ;({ container } = await renderWithContexts(
      <FavorisPage
        beneficiaire={uneBaseBeneficiaire()}
        offres={offres}
        recherches={recherches}
        lectureSeule={false}
      />
    ))
  })

  it('a11y', async () => {
    let results: AxeResults

    await act(async () => {
      results = await axe(container)
    })

    expect(results!).toHaveNoViolations()
  })

  it('affiche la liste des offres du jeune', () => {
    // Then
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      'Offres 4 éléments'
    )
    offres.forEach((offre) => {
      expect(screen.getByText(offre.titre)).toBeInTheDocument()
    })
  })

  it('permet d’accéder à l’offre d’emploi', async () => {
    // Then
    const offre = screen.getByRole('link', {
      name: 'Ouvrir l’offre Offre d’emploi idOffre1 offre 1 organisation Postulée le 07/03/2025',
    })

    expect(offre).toHaveAttribute('href', '/offres/emploi/idOffre1')
  })

  it('permet d’accéder à l’offre de service civique', async () => {
    // Then
    const offre = screen.getByRole('link', {
      name: 'Ouvrir l’offre Service civique idOffre2 offre 2 organisation Enregistrée le 01/03/2025',
    })

    expect(offre).toHaveAttribute('href', '/offres/service-civique/idOffre2')
  })

  it('permet d’accéder à l’offre d’immersion', async () => {
    // Then
    const offre = screen.getByRole('link', {
      name: 'Ouvrir l’offre Immersion idOffre3 offre 3 organisation Enregistrée le 27/02/2025',
    })

    expect(offre).toHaveAttribute('href', '/offres/immersion/idOffre3')
  })

  it('permet d’accéder à l’offre d’alternance', async () => {
    // Then
    const offre = screen.getByRole('link', {
      name: 'Ouvrir l’offre Alternance idOffre4 offre 4 organisation Enregistrée le 22/02/2025',
    })

    expect(offre).toHaveAttribute('href', '/offres/alternance/idOffre4')
  })

  it('affiche la liste de ses recherches', async () => {
    // When
    const tabActions = screen.getByRole('tab', {
      name: 'Recherches 2 éléments',
    })
    await userEvent.click(tabActions)

    // Then
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
      'Recherches 2 éléments'
    )
    recherches.forEach((recherche) => {
      expect(screen.getByText(recherche.titre)).toBeInTheDocument()
    })
  })
})
