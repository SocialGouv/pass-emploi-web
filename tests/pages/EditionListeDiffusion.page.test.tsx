import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mockedListesDeDiffusionService } from 'fixtures/services'
import EditionListeDiffusion from 'pages/mes-jeunes/listes-de-diffusion/edition-liste'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/injectionDependances/withDependance')

describe('Page d’édition d’une liste de diffusion', () => {
  describe('client side', () => {
    it('affiche le formulaire', () => {
      // Given - When
      render(<EditionListeDiffusion />)

      // Then
      expect(screen.getByRole('textbox', { name: 'Titre' })).toHaveProperty(
        'required',
        true
      )
      expect(
        screen.getByRole('combobox', { name: /Rechercher et ajouter/ })
      ).toHaveAttribute('aria-required', 'true')

      expect(
        screen.getByRole('button', { name: 'Créer la liste' })
      ).toBeInTheDocument()

      expect(screen.getByRole('link', { name: 'Annuler' })).toHaveAttribute(
        'href',
        '/mes-jeunes/listes-de-diffusion'
      )
    })

    describe('formulaire rempli', () => {
      describe('quand le formulaire est validé', () => {
        it('crée la liste', async () => {
          // Given
          let listesDeDiffusionService: ListesDeDiffusionService
          listesDeDiffusionService = mockedListesDeDiffusionService()

          render(<EditionListeDiffusion />)
          ;(withDependance as jest.Mock).mockReturnValue(
            listesDeDiffusionService
          )
          // When
          await userEvent.click(
            screen.getByRole('button', { name: 'Créer la liste' })
          )
          // Then
          expect(listesDeDiffusionService.creerListe).toHaveBeenCalledWith({
            titre: 'Liste métiers aéronautique',
            idsDestinataires: [],
          })
        })
      })
    })
  })
})
