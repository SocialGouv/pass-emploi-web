import { screen } from '@testing-library/dom'
import { within } from '@testing-library/react'
import React from 'react'

import { CommentairesAction } from 'components/action/CommentairesAction'
import { unCommentaire } from 'fixtures/action'
import { unConseiller } from 'fixtures/conseiller'
import { Commentaire } from 'interfaces/action'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/actions.service')

describe('<CommentairesAction/>', () => {
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

  describe('quand il y a des commentaires', () => {
    describe('render', () => {
      let commentaires: Commentaire[]

      beforeEach(() => {
        // Given
        commentaires = [commentaireDuConseiller, commentaireDuJeune]

        // When
        renderWithContexts(
          <CommentairesAction commentairesInitiaux={commentaires} />,
          {
            customConseiller: unConseiller({ id: 'id-conseiller' }),
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
    })
  })
})
