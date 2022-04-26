import { RenderResult, screen, waitFor } from '@testing-library/react'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import renderWithSession from '../renderWithSession'

import { uneAction } from 'fixtures/action'
import { unJeune } from 'fixtures/jeune'
import { mockedActionsService } from 'fixtures/services'
import { Action, StatutAction } from 'interfaces/action'
import { Jeune } from 'interfaces/jeune'
import PageAction, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions/[action_id]/index'
import { ActionsService } from 'services/actions.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { DIProvider } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe("Page Détail d'une action d'un jeune", () => {
  describe('client-side', () => {
    const action = uneAction()
    const jeune = unJeune()
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
            StatutAction.Commencee,
            'accessToken'
          )
        })
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

    describe('quand le conseiller est Pole emploi', () => {
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

    describe("quand le conseiller n'est pas Pole emploi", () => {
      let action: Action
      let jeune: Jeune
      let actionsService: ActionsService
      let actual: GetServerSidePropsResult<any>
      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            accessToken: 'accessToken',
            user: { structure: 'MILO' },
          },
        })
        action = uneAction()
        jeune = unJeune()
        actionsService = mockedActionsService({
          getAction: jest.fn(async () => ({ action, jeune })),
        })
        ;(withDependance as jest.Mock).mockReturnValue(actionsService)

        // When
        actual = await getServerSideProps({
          query: { action_id: 'id-action', envoiMessage: 'succes' },
        } as unknown as GetServerSidePropsContext)
      })

      it("récupère les info de l'action et du jeune", async () => {
        // Then
        expect(actionsService.getAction).toHaveBeenCalledWith(
          'id-action',
          'accessToken'
        )
        const pageTitle = `Mes jeunes - Actions de ${jeune.firstName} ${jeune.lastName} - ${action.content}`
        expect(actual).toMatchObject({ props: { action, jeune, pageTitle } })
      })

      it("récupère le succès d'envoie de message groupé", () => {
        // Then
        expect(actual).toMatchObject({
          props: { messageEnvoiGroupeSuccess: true },
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
