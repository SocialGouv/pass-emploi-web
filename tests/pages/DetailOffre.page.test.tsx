import { screen } from '@testing-library/react'

import renderWithContexts from '../renderWithContexts'

import DetailOffre from 'pages/offres/[offre_id]/detail'

describe('Page Détail Offre', () => {
  describe('client side', () => {
    let offre: any

    it('affiche les informations détaillées de l’offre', () => {
      // Given
      offre = {}

      // When
      renderWithContexts(
        <DetailOffre
          offre={offre}
          pageTitle={'Détail de l’offre'}
          returnTo={'/return/to'}
        />
      )

      // Then
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: offre.titre,
        })
      ).toBeInTheDocument()
    })
  })
})
