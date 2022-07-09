import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'

import AlertDisplayer from 'components/layouts/AlertDisplayer'

describe('AlertDisplayer', () => {
  describe('quand la création de rdv est réussie', () => {})
  describe('quand la modification de rdv est réussie', () => {})
  describe('quand la suppression de rdv est réussie', () => {})
  describe('quand la création d’une action est réussie', () => {})
  describe('quand on vient de récupérer des bénéficiaires', () => {})
  describe('quand on vient de supprimer un jeune', () => {})
  describe('envoie de message multi-destinataire', () => {
    let routerPush: Function
    beforeEach(() => {
      // Given
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        asPath: '/mes-jeunes?envoiMessage=succes',
        query: { envoiMessage: 'succes' },
        push: routerPush,
      })

      // When
      render(<AlertDisplayer />)
    })

    it("affiche l'alerte de succès", () => {
      // Then
      expect(
        screen.getByText(/Votre message multi-destinataires/)
      ).toBeInTheDocument()
    })

    it("permet de fermer l'alerte du succès", async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', { name: "J'ai compris" })
      )

      // Then
      expect(routerPush).toHaveBeenCalledWith(
        {
          pathname: '/mes-jeunes',
          query: {},
        },
        undefined,
        { shallow: true }
      )
    })
  })
})
