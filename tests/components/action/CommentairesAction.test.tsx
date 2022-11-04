import { screen } from '@testing-library/dom'
import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { CommentairesAction } from 'components/action/CommentairesAction'
import { unCommentaire } from 'fixtures/action'
import { unConseiller } from 'fixtures/conseiller'
import { mockedActionsService } from 'fixtures/services'
import { Commentaire } from 'interfaces/action'
import { ActionsService } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'

describe('<CommentairesAction/>', () => {
  let onAjoutStub = jest.fn()
  const commentaireDuJeune = unCommentaire({
    id: 'id-commentaire-1',
    message: 'un message de jeune',
    date: '2022-02-20T14:50:46.000Z',
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
    date: '2022-02-21T14:50:46.000Z',
    createur: {
      id: 'id-conseiller',
      nom: 'Tavernier',
      prenom: 'Nils',
      type: 'conseiller',
    },
  })
  const nouveauCommentaire = unCommentaire({
    id: 'id-commentaire-3',
    message: 'nouveau commentaire conseiller',
    date: '2022-02-21T14:50:46.000Z',
    createur: {
      id: 'id-conseiller',
      nom: 'Tavernier',
      prenom: 'Nils',
      type: 'conseiller',
    },
  })

  describe('quand il y a des commentaires', () => {
    describe('render', () => {
      let commentaires: Commentaire[]
      let actionsService: ActionsService
      beforeEach(() => {
        // Given
        commentaires = [commentaireDuConseiller, commentaireDuJeune]
        actionsService = mockedActionsService({
          ajouterCommentaire: jest.fn(async () => nouveauCommentaire),
        })

        // When
        renderWithContexts(
          <CommentairesAction
            idAction={'id-action'}
            commentairesInitiaux={commentaires}
            onAjout={onAjoutStub}
          />,
          {
            customConseiller: unConseiller({ id: 'id-conseiller' }),
            customDependances: { actionsService },
          }
        )
      })

      it('affiche le contenu des messages', () => {
        // Then
        commentaires.forEach(({ message }) =>
          expect(screen.getByText(message)).toBeInTheDocument()
        )
      })

      it('affiche la date des messages', () => {
        // Then
        expect(screen.getByText('20/02/2022 à 15h50')).toBeInTheDocument()
        expect(screen.getByText('21/02/2022 à 15h50')).toBeInTheDocument()
      })

      it('', () => {
        // Then
        expect(
          within(
            screen.getByText('un message de jeune').parentElement!
          ).getByText('Jack Dawson')
        ).toBeInTheDocument()
        expect(
          within(
            screen.getByText('un message de conseiller').parentElement!
          ).getByText('vous')
        ).toBeInTheDocument()
      })

      describe('quand on ajoute un commentaire', () => {
        beforeEach(async () => {
          // Given
          const textbox = screen.getByRole('textbox')
          await userEvent.type(textbox, 'test')

          // When
          const submitButton = screen.getByRole('button', {
            name: 'Ajouter un commentaire',
          })
          await userEvent.click(submitButton)
        })

        it('le crée et met à jour la liste', () => {
          // Then
          expect(actionsService.ajouterCommentaire).toHaveBeenCalledWith(
            'id-action',
            'test'
          )
          expect(
            screen.getByText(commentaireDuJeune.message)
          ).toBeInTheDocument()
          expect(
            screen.getByText(commentaireDuConseiller.message)
          ).toBeInTheDocument()
          expect(
            screen.getByText(nouveauCommentaire.message)
          ).toBeInTheDocument()
        })

        it("vide l'input", () => {
          expect(screen.getByRole('textbox')).toHaveValue('')
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
})
