import { render, screen } from '@testing-library/react'

import LienRetour from 'components/LienRetour'

describe('<LienRetour/>', () => {
  it('Affiche le lien de retour vers une URL', () => {
    // Given
    render(
      <LienRetour returnUrlOrPath='http://localhost:3000/mes-jeunes/id-jeune' />
    )
    // Then
    expect(
      screen.getByRole('link', { name: 'Retour à Fiche jeune' })
    ).toHaveAttribute('href', 'http://localhost:3000/mes-jeunes/id-jeune')
  })

  it('Affiche le lien de retour vers un chemin', () => {
    // Given
    render(
      <LienRetour returnUrlOrPath='/mes-jeunes/id-jeune/actions/id-action' />
    )
    // Then
    expect(
      screen.getByRole('link', { name: 'Retour à Détail action' })
    ).toHaveAttribute('href', '/mes-jeunes/id-jeune/actions/id-action')
  })
})
