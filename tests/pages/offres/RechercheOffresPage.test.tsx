import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import React from 'react'

import RechercheOffres from 'app/(connected)/(with-sidebar)/(with-chat)/offres/RechercheOffresPage'
import { searchOffresEmploi } from 'services/offres-emploi.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/offres-emploi.service')

describe('Page Recherche Offres', () => {
  let container: HTMLElement

  beforeEach(() => {
    ;({ container } = renderWithContexts(<RechercheOffres />, {}))
  })

  it('a11y', async () => {
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('nécessite de selectionner un type d’offre', () => {
    // Then
    expect(
      screen.getByRole('heading', { level: 2, name: 'Ma recherche' })
    ).toBeInTheDocument()

    const etape1 = screen.getByRole('group', {
      name: 'Étape 1: Sélectionner un type d’offre',
    })
    expect(etape1).toBeInTheDocument()
    expect(
      within(etape1).getByRole('radio', { name: 'Offre d’emploi' })
    ).not.toHaveAttribute('disabled')
    expect(
      within(etape1).getByRole('radio', { name: 'Service civique' })
    ).not.toHaveAttribute('disabled')

    expect(() => screen.getByRole('group', { name: /Étape 2/ })).toThrow()
    expect(() => screen.getByRole('button', { name: 'Rechercher' })).toThrow()
  })

  it('n’affiche pas de résultat par défaut', () => {
    // Then
    expect(() => screen.getByText('Liste des résultats')).toThrow()
    expect(() => screen.getByRole('list')).toThrow()
  })

  it('affiche une erreur si la recherche échoue', async () => {
    // Given
    await userEvent.click(screen.getByRole('radio', { name: 'Offre d’emploi' }))
    ;(searchOffresEmploi as jest.Mock).mockRejectedValue('whatever')

    // When
    const submitButton = screen.getByRole('button', { name: 'Rechercher' })
    await userEvent.click(submitButton)

    // Then
    expect(
      screen
        .getAllByRole('alert')
        .find((pouet) => /Une erreur est survenue/.test(pouet.textContent!))
    ).toBeInTheDocument()
  })

  it("affiche un message s'il n'y a pas de résultat", async () => {
    // Given
    await userEvent.click(screen.getByRole('radio', { name: 'Offre d’emploi' }))
    ;(searchOffresEmploi as jest.Mock).mockResolvedValue({
      metadonnees: { nombreTotal: 0, nombrePages: 0 },
      offres: [],
    })

    // When
    const submitButton = screen.getByRole('button', { name: 'Rechercher' })
    await userEvent.click(submitButton)

    // Then
    expect(
      screen.getByText(
        'Pour le moment, aucune offre ne correspond à vos critères.'
      )
    ).toBeInTheDocument()
  })
})
