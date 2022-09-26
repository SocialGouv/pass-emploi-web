import { screen } from '@testing-library/dom'
import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { CommentairesAction } from 'components/action/CommentairesAction'
import { unCommentaire } from 'fixtures/action'
import { unConseiller } from 'fixtures/conseiller'
import { mockedActionsService } from 'fixtures/services'
import renderWithContexts from 'tests/renderWithContexts'

describe('<CommentairesAction/>', () => {
  let onAjoutStub = jest.fn()
  const commentaireDuJeune = unCommentaire({
    id: 'id-commentaire-1',
    message: 'un message de jeune',
    createur: {
      id: 'id-jeune',
      nom: 'Dawson',
      prenom: 'Jack',
      type: 'jeune',
    },
  })
  const commentaireDuConseiller = unCommentaire({
    id: 'id-commentaire-2',
    message: 'un message de conseiller',
    createur: {
      id: 'id-conseiller',
      nom: 'Tavernier',
      prenom: 'Nils',
      type: 'conseiller',
    },
  })

  describe('quand il y a des commentaires', () => {
    describe("quand c'est le commentaire du conseiller", () => {
      beforeEach(() => {
        // When
        renderWithContexts(
          <CommentairesAction
            idAction={'id-action'}
            commentairesInitiaux={[commentaireDuConseiller]}
            onAjout={onAjoutStub}
          />,
          { customConseiller: unConseiller({ id: 'id-conseiller' }) }
        )
      })

      it("affiche le commentaire en précisant que c'est le conseiller", () => {
        // Then
        expect(screen.getByText('vous')).toBeInTheDocument()
      })

      it("affiche l'heure", () => {
        // Then
        expect(screen.getByText('20/02/2022 à 15h50')).toBeInTheDocument()
      })
    })

    describe("quand c'est le commentaire du jeune", () => {
      it('affiche le nom du jeune', () => {
        // When
        renderWithContexts(
          <CommentairesAction
            idAction={'id-action'}
            commentairesInitiaux={[commentaireDuJeune]}
            onAjout={onAjoutStub}
          />
        )

        // Then
        expect(screen.getByText('Jack Dawson')).toBeInTheDocument()
      })
    })

    describe('quand on ajoute un commentaire', () => {
      it('le crée et met à jour la liste', async () => {
        // Given
        const actionsService = mockedActionsService({
          ajouterCommentaire: jest.fn(async () => commentaireDuConseiller),
        })
        renderWithContexts(
          <CommentairesAction
            idAction={'id-action'}
            commentairesInitiaux={[commentaireDuJeune]}
            onAjout={onAjoutStub}
          />,
          { customDependances: { actionsService } }
        )

        const textbox = screen.getByRole('textbox')
        await act(() => userEvent.type(textbox, 'test'))

        // When
        const submitButton = screen.getByRole('button', {
          name: 'Ajouter un commentaire',
        })
        await act(() => userEvent.click(submitButton))

        // Then
        expect(screen.getByText(commentaireDuJeune.message)).toBeInTheDocument()
        expect(
          screen.getByText(commentaireDuConseiller.message)
        ).toBeInTheDocument()
      })
    })
  })

  describe("quand il n'y a pas de commentaire", () => {
    it('affiche le message idoine', () => {
      // When
      renderWithContexts(
        <CommentairesAction
          idAction={'id-action'}
          commentairesInitiaux={[]}
          onAjout={onAjoutStub}
        />
      )

      // Then
      expect(
        screen.getByText("Vous n'avez pas encore de commentaire")
      ).toBeInTheDocument()
    })
  })
})
