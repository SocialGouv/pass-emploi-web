import { render, screen } from '@testing-library/react'

import RechercheOffres from 'pages/recherche-offres'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Page Recherche Offres', () => {
  describe('client side', () => {
    it('affiche un bouton pour lancer la recherche', () => {
      // Given
      render(<RechercheOffres />)

      // Then
      expect(
        screen.getByRole('button', { name: 'Rechercher' })
      ).toBeInTheDocument()
    })

    it('permet de saisir des mots clés', () => {
      // Given
      render(<RechercheOffres />)

      // Then
      expect(screen.getByLabelText(/Mots clés/)).toHaveAttribute('type', 'text')
    })
  })
})
