import { render, screen } from '@testing-library/react'

import FilAriane from 'components/FilAriane'

describe('<FilAriane/>', () => {
  describe('Pour une route spécifique', () => {
    it('Affiche le fil d’ariane pour une route de niveau 2', () => {
      // Given
      render(<FilAriane path='/mes-jeunes/id-jeune' />)
      // Then
      expect(
        screen.getByRole('link', { name: 'Portefeuille' })
      ).toHaveAttribute('href', '/mes-jeunes')
      expect(
        screen.getByRole('link', { name: 'Fiche bénéficiaire' })
      ).toHaveAttribute('href', '/mes-jeunes/id-jeune')
    })

    it('Affiche le fil d’ariane pour une route de niveau 3', () => {
      // Given
      render(<FilAriane path='/mes-jeunes/id-jeune/actions/id-action' />)
      // Then
      expect(screen.getByText('Portefeuille')).toBeInTheDocument()
      expect(screen.getByText('Fiche bénéficiaire')).toBeInTheDocument()
      expect(screen.getAllByRole('link').length).toEqual(3)
      expect(
        screen.getByRole('link', { name: 'Détail action' })
      ).toHaveAttribute('href', '/mes-jeunes/id-jeune/actions/id-action')
    })

    it('N’affiche pas le fil d’ariane pour une route de niveau 1', () => {
      // Given
      render(<FilAriane path='/mes-jeunes' />)
      // Then
      expect(
        screen.queryByRole('link', { name: 'Portefeuille' })
      ).not.toBeInTheDocument()
    })
  })

  describe('Pour une route qui ne doit pas avoir de fil d’ariane', () => {
    it('N’affiche pas le fil d’ariane', () => {
      // Given
      render(<FilAriane path='/agenda/id-rdv' />)
      // Then
      expect(
        screen.queryByRole('link', { name: 'Mes événements' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: 'id-rdv' })
      ).not.toBeInTheDocument()
    })
  })
})
