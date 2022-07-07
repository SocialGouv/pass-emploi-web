import { RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { uneAction } from 'fixtures/action'
import { mockedActionsService } from 'fixtures/services'
import { Action, StatutAction } from 'interfaces/action'
import { BaseJeune } from 'interfaces/jeune'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'
import PageAction, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions/[action_id]'
import React from 'react'
import { ActionsService } from 'services/actions.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

import renderWithSession from '../renderWithSession'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe("Page Détail d'une action d'un jeune", () => {
  describe('client-side', () => {
    const action = uneAction()
    const jeune: BaseJeune = {
      id: 'jeune-1',
      prenom: 'Nadia',
      nom: 'Sanfamiye',
    }
    let actionsService: ActionsService
    let page: RenderResult
    beforeEach(() => {
      actionsService = {
        getAction: jest.fn(),
        countActionsJeunes: jest.fn(),
        getActionsJeune: jest.fn(),
        createAction: jest.fn(),
        updateAction: jest.fn((_, statut) => Promise.resolve(statut)),
        deleteAction: jest.fn(),
      }
      page = renderWithSession(
        <DIProvider dependances={{ actionsService }}>
          <PageAction action={action} jeune={jeune} pageTitle='' />
        </DIProvider>
      )
    })

    it("Devrait afficher les information d'une action", () => {
      expect(screen.getByText(action.comment)).toBeInTheDocument()
      expect(screen.getByText('15/02/2022')).toBeInTheDocument()
      expect(screen.getByText('16/02/2022')).toBeInTheDocument()
      expect(screen.getByText(action.creator)).toBeInTheDocument()
    })

    describe('Au clique sur un statut', () => {
      it("déclenche le changement de statut de l'action", async () => {
        // Given
        const statutRadio = screen.getByText('Commencée')

        // When
        await userEvent.click(statutRadio)

        // Then
        expect(actionsService.updateAction).toHaveBeenCalledWith(
          action.id,
          StatutAction.Commencee,
          'accessToken'
        )
      })
    })

    describe('Au clique sur la suppression', () => {})
  })

  describe('server-side', () => {
    it('requiert une session valide', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: 'wherever',
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: 'wherever' })
    })

    describe('quand le conseiller est Pôle emploi', () => {
      it('renvoie une 404', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { structure: 'POLE_EMPLOI' },
          },
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ notFound: true })
      })
    })

    describe("quand le conseiller n'est pas Pôle emploi", () => {
      it("récupère les info de l'action et du jeune", async () => {
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            accessToken: 'accessToken',
            user: { structure: 'MILO' },
          },
        })
        const action: Action = uneAction()
        const jeune: BaseJeune = {
          id: 'jeune-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
        }
        const actionsService: ActionsService = mockedActionsService({
          getAction: jest.fn(async () => ({ action, jeune })),
        })
        ;(withDependance as jest.Mock).mockReturnValue(actionsService)

        // When
        const actual: GetServerSidePropsResult<any> = await getServerSideProps({
          query: { action_id: 'id-action', envoiMessage: 'succes' },
        } as unknown as GetServerSidePropsContext) // Then
        expect(actionsService.getAction).toHaveBeenCalledWith(
          'id-action',
          'accessToken'
        )
        const pageTitle = `Mes jeunes - Actions de ${jeune.prenom} ${jeune.nom} - ${action.content}`
        expect(actual).toEqual({
          props: {
            action,
            jeune,
            pageTitle,
            pageHeader: 'Détails de l’action',
            messageEnvoiGroupeSuccess: true,
          },
        })
      })
    })

    describe("quand l'action n'existe pas", () => {
      it('renvoie une 404', async () => {
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            accessToken: 'accessToken',
            user: { structure: 'MILO' },
          },
        })
        const actionsService: ActionsService = mockedActionsService({
          getAction: jest.fn(async () => undefined),
        })
        ;(withDependance as jest.Mock).mockReturnValue(actionsService)

        // When
        let actual: GetServerSidePropsResult<any> = await getServerSideProps({
          query: { action_id: 'id-action', envoiMessage: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({ notFound: true })
      })
    })
  })
})
