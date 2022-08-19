import { screen } from '@testing-library/dom'
import { act, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { CommentairesAction } from 'components/action/CommentairesAction'
import { unCommentaire } from 'fixtures/action'
import { unConseiller } from 'fixtures/conseiller'
import { mockedActionsService } from 'fixtures/services'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { DIProvider } from 'utils/injectionDependances'

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
  const conseiller = unConseiller({
    id: 'id-conseiller',
  })

  describe('quand il y a des commentaires', () => {
    describe("quand c'est le commentaire du conseiller", () => {
      beforeEach(() => {
        // When
        render(
          <DIProvider dependances={{ actionsService: mockedActionsService() }}>
            <ConseillerProvider conseiller={conseiller}>
              <CommentairesAction
                idAction={'id-action'}
                commentairesInitiaux={[commentaireDuConseiller]}
                onAjout={onAjoutStub}
              />
            </ConseillerProvider>
          </DIProvider>
        )
      })
      it("affiche le commentaire en précisant que c'est le conseiller", () => {
        // Then
        expect(screen.getByText('vous')).toBeInTheDocument()
      })
      it("affiche l'heure", () => {
        // Then
        expect(
          screen.getByText('dimanche 20 février 2022 à 15h50')
        ).toBeInTheDocument()
      })
    })
    describe("quand c'est le commentaire du jeune", () => {
      it('affiche le nom du jeune', () => {
        // When
        render(
          <DIProvider dependances={{ actionsService: mockedActionsService() }}>
            <ConseillerProvider conseiller={conseiller}>
              <CommentairesAction
                idAction={'id-action'}
                commentairesInitiaux={[commentaireDuJeune]}
                onAjout={onAjoutStub}
              />
            </ConseillerProvider>
          </DIProvider>
        )

        // Then
        expect(screen.getByText('Jack Dawson')).toBeInTheDocument()
      })
    })
    describe('quand on ajoute un commentaire', () => {
      it('le crée et met à jour la liste', async () => {
        // Given
        const actionsService = mockedActionsService({
          ajouterCommentaire: jest
            .fn()
            .mockResolvedValue(commentaireDuConseiller),
        })
        await act(() => {
          render(
            <DIProvider dependances={{ actionsService: actionsService }}>
              <ConseillerProvider conseiller={conseiller}>
                <CommentairesAction
                  idAction={'id-action'}
                  commentairesInitiaux={[commentaireDuJeune]}
                  onAjout={onAjoutStub}
                />
              </ConseillerProvider>
            </DIProvider>
          )
        })
        const textbox = screen.getByRole('textbox')
        fireEvent.change(textbox, { target: { value: 'test' } })
        const submitButton = screen.getByRole('button', {
          name: 'Ajouter un commentaire',
        })

        // When
        await userEvent.click(submitButton)

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
      render(
        <DIProvider dependances={{ actionsService: mockedActionsService() }}>
          <ConseillerProvider conseiller={conseiller}>
            <CommentairesAction
              idAction={'id-action'}
              commentairesInitiaux={[]}
              onAjout={onAjoutStub}
            />
          </ConseillerProvider>
        </DIProvider>
      )

      // Then
      expect(
        screen.getByText("Vous n'avez pas encore de commentaire")
      ).toBeInTheDocument()
    })
  })
})
