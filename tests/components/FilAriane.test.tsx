import { render, screen } from '@testing-library/react'

import FilAriane from 'components/FilAriane'

describe('<FilAriane/>', () => {
  describe('Pour une route spécifique', () => {
    it('Affiche le fil d’ariane pour une route de niveau 2', () => {
      // Given
      render(
        <FilAriane
          currentPath='/mes-jeunes/id-jeune'
          currentRoute='/mes-jeunes/[jeune_id]'
        />
      )
      // Then
      expect(
        screen.getByRole('link', { name: 'Portefeuille' })
      ).toHaveAttribute('href', '/mes-jeunes')
      expect(screen.getByRole('link', { name: 'Fiche jeune' })).toHaveAttribute(
        'href',
        '/mes-jeunes/id-jeune'
      )
    })

    it('Affiche le fil d’ariane pour une route de niveau 3', () => {
      // Given
      render(
        <FilAriane
          currentPath='/mes-jeunes/id-jeune/actions/id-action'
          currentRoute='/mes-jeunes/[jeune_id]/actions/[action_id]'
        />
      )
      // Then
      expect(screen.getByText('Portefeuille')).toBeInTheDocument()
      expect(screen.getByText('Fiche jeune')).toBeInTheDocument()
      expect(screen.getAllByRole('link').length).toEqual(3)
      expect(
        screen.getByRole('link', { name: 'Détail action' })
      ).toHaveAttribute('href', '/mes-jeunes/id-jeune/actions/id-action')
    })

    it('N’affiche pas le fil d’ariane pour une route de niveau 1', () => {
      // Given
      render(<FilAriane currentPath='/mes-jeunes' currentRoute='/mes-jeunes' />)
      // Then
      expect(
        screen.queryByRole('link', { name: 'Portefeuille' })
      ).not.toBeInTheDocument()
    })
  })

  describe('Pour une route qui ne doit pas avoir de fil d’ariane', () => {
    it('N’affiche pas le fil d’ariane', () => {
      // Given
      render(
        <FilAriane
          currentPath='/mes-rendezvous/id-rdv'
          currentRoute='/mes-rendezvous/[rendezvous_id]'
        />
      )
      // Then
      expect(
        screen.queryByRole('link', { name: 'Mes rendez-vous' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: 'id-rdv' })
      ).not.toBeInTheDocument()
    })
  })
})
