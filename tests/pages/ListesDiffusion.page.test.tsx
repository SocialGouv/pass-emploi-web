import { render, screen } from '@testing-library/react'
import ListesDiffusion from '../../pages/mes-jeunes/listes-de-diffusion'

describe('Page Listes de Diffusion', () => {
  describe('client side', () => {
    it('', async () => {
      // Given

      // When
      render(<ListesDiffusion />)

      // Then
      expect(
        screen.getByText('Vous n’avez aucune liste de diffusion.')
      ).toBeInTheDocument()
    })
  })
})
