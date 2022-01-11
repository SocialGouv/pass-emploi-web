import { RenderResult, screen, waitFor } from '@testing-library/react'
import { uneAction } from 'fixtures/action'
import { unJeune } from 'fixtures/jeune'
import { ActionStatus } from 'interfaces/action'
import PageAction from 'pages/mes-jeunes/[jeune_id]/actions/[action_id]/index'
import React from 'react'
import { ActionsService } from 'services/actions.service'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'

describe("Page Détail d'une action d'un jeune", () => {
  const action = uneAction()
  const jeune = unJeune()
  let actionsService: ActionsService
  let page: RenderResult

  beforeEach(() => {
    actionsService = {
      getAction: jest.fn(),
      getActionsJeune: jest.fn(),
      createAction: jest.fn(),
      updateAction: jest.fn((_, statut) => Promise.resolve(statut)),
      deleteAction: jest.fn(),
    }
    page = renderWithSession(
      <DIProvider dependances={{ actionsService }}>
        <PageAction action={action} jeune={jeune} />
      </DIProvider>
    )
  })

  it("Devrait afficher les information d'une action", () => {
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: action.content,
      })
    ).toBeInTheDocument()

    expect(screen.getByText(action.comment)).toBeInTheDocument()

    expect(screen.getByText('21/10/2021')).toBeInTheDocument()
  })

  it('Devrait avoir un lien pour revenir sur la page précédente', () => {
    const backLink = screen.getByLabelText(
      "Retour sur la liste d'actions du jeune"
    )

    expect(backLink).toBeInTheDocument()

    expect(backLink).toHaveAttribute('href', '/mes-jeunes/jeune-1/actions')
  })

  describe('Au clique sur un statut', () => {
    it("déclenche le changement de statut de l'action", async () => {
      // Given
      const statutRadio = screen.getByText('En cours')

      // When
      statutRadio.click()

      // Then
      await waitFor(() => {
        expect(actionsService.updateAction).toHaveBeenCalledWith(
          action.id,
          ActionStatus.InProgress,
          'accessToken'
        )
      })
    })
  })

  describe('Au clique sur la suppression', () => {})
})
