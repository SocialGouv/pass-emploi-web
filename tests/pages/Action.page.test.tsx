import { RenderResult, screen, waitFor } from '@testing-library/react'
import { uneAction } from 'fixtures/action'
import { unJeune } from 'fixtures/jeune'
import { ActionStatus } from 'interfaces/action'
import { GetServerSidePropsContext } from 'next/types'
import PageAction, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions/[action_id]/index'
import React from 'react'
import { ActionsService } from 'services/actions.service'
import { DIProvider } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import renderWithSession from '../renderWithSession'

jest.mock('utils/withMandatorySessionOrRedirect')

afterAll(() => jest.clearAllMocks())

describe("Page Détail d'une action d'un jeune", () => {
  describe('pour un conseiller MiLo', () => {
    const action = uneAction()
    const jeune = unJeune()
    let actionsService: ActionsService
    let page: RenderResult
    beforeEach(() => {
      actionsService = {
        getAction: jest.fn(),
        getActions: jest.fn(),
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
      expect(screen.getByText(action.content)).toBeInTheDocument()
      expect(screen.getByText(action.comment)).toBeInTheDocument()
      expect(screen.getByText('15/02/2022')).toBeInTheDocument()
      expect(screen.getByText('16/02/2022')).toBeInTheDocument()
      expect(screen.getByText(action.creator)).toBeInTheDocument()
    })

    it('Devrait avoir un lien pour revenir sur la page précédente', () => {
      const backLink = screen.getByRole('link', {
        name: 'Actions de Kenji Jirac',
      })

      expect(backLink).toBeInTheDocument()
      expect(backLink).toHaveAttribute('href', '/mes-jeunes/jeune-1/actions')
    })

    describe('Au clique sur un statut', () => {
      it("déclenche le changement de statut de l'action", async () => {
        // Given
        const statutRadio = screen.getByText('Commencée')

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

  describe('Pour un conseiller Pole Emploi', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        session: {
          user: { structure: 'POLE_EMPLOI' },
        },
        hasSession: true,
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ notFound: true })
    })
  })
})
