import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { uneListeDActionsAQualifier } from 'fixtures/action'
import { mockedActionsService } from 'fixtures/services'
import Pilotage from 'pages/pilotage'
import { getServerSideProps } from 'pages/pilotage'
import { ActionsService } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Pilotage', () => {
  describe('Client side', () => {
    describe('quand le conseiller à des actions à qualifier', () => {
      let actionsService: ActionsService
      beforeEach(async () => {
        actionsService = mockedActionsService({
          getActionsAQualifierClientSide: jest.fn(),
        })
        renderWithContexts(
          <Pilotage
            withoutChat={true}
            pageTitle=''
            actions={uneListeDActionsAQualifier()}
            metadonneesActions={{ nombrePages: 1, nombreTotal: 5 }}
          />,
          { customDependances: { actionsService } }
        )
      })

      it('affiche un tableau d’actions à qualifier ', () => {
        // Given
        const tableauDActions = screen.getByRole('table', {
          name: 'Liste des actions à qualifier.',
        })

        // Then
        expect(
          within(tableauDActions).getByText('Bénéficiaire')
        ).toBeInTheDocument()
        expect(
          within(tableauDActions).getByText('Date de réalisation')
        ).toBeInTheDocument()
        expect(
          within(tableauDActions).getByText('Titre de l’action')
        ).toBeInTheDocument()
      })

      it('affiche les actions du conseiller à qualifier', async () => {
        // Given
        const actions = uneListeDActionsAQualifier()

        // Then
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Actions à qualifier 5')

        actions.forEach((action) => {
          expect(screen.getByText(action.titre)).toBeInTheDocument()
          expect(screen.getByText(action.dateFinReelle)).toBeInTheDocument()
          expect(
            screen.getByText(
              `${action.beneficiaire.nom} ${action.beneficiaire.prenom}`
            )
          ).toBeInTheDocument()
          expect(
            screen.getByLabelText(`Détail de l’action : ${action.titre}`)
          ).toHaveAttribute(
            'href',
            `/mes-jeunes/${action.beneficiaire.id}/actions/${action.id}`
          )
        })
      })
    })

    describe('pagination', () => {
      let actionsService: ActionsService
      let pageCourante: number
      beforeEach(async () => {
        // Given
        actionsService = mockedActionsService({
          getActionsAQualifierClientSide: jest.fn(async () => ({
            actions: [...uneListeDActionsAQualifier()],
            metadonnees: { nombreTotal: 52, nombrePages: 6 },
          })),
        })
        renderWithContexts(
          <Pilotage
            withoutChat={true}
            pageTitle=''
            actions={uneListeDActionsAQualifier()}
            metadonneesActions={{ nombrePages: 3, nombreTotal: 25 }}
          />,
          { customDependances: { actionsService } }
        )
        pageCourante = 4
      })

      it('met à jour les actions avec la page demandée ', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(
          actionsService.getActionsAQualifierClientSide
        ).toHaveBeenCalledWith('1', 2)
      })
    })

    describe("quand le conseiller n'a pas d'action à qualifier", () => {
      it('affiche un message qui le précise', async () => {
        // Given
        let actionsService: ActionsService
        actionsService = mockedActionsService({
          getActionsAQualifierClientSide: jest.fn(),
        })
        renderWithContexts(
          <Pilotage
            withoutChat={true}
            pageTitle=''
            actions={[]}
            metadonneesActions={{ nombrePages: 1, nombreTotal: 0 }}
          />,
          { customDependances: { actionsService } }
        )

        // When
        await userEvent.click(
          screen.getByRole('tab', { name: /Actions à qualifier/ })
        )

        // Then
        expect(
          screen.getByText('Vous n’avez pas d’action à qualifier.')
        ).toBeInTheDocument()
      })
    })
  })
  describe('Server side', () => {
    it('requiert une session valide', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: { destination: 'whatever' },
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: { destination: 'whatever' } })
    })

    it('prépare la page ( recupère les actions à qualifier )', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        redirect: { destination: 'whatever' },
        session: {
          accessToken: 'accessToken',
          user: { id: 'conseiller-id' },
        },
      })

      const actionsService: ActionsService = mockedActionsService({
        getActionsAQualifierServerSide: jest.fn(async () => ({
          actions: uneListeDActionsAQualifier(),
          metadonnees: {
            nombreTotal: 5,
            nombrePages: 1,
          },
        })),
      })
      ;(withDependance as jest.Mock).mockReturnValue(actionsService)

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(
        actionsService.getActionsAQualifierServerSide
      ).toHaveBeenCalledWith('conseiller-id', 'accessToken')
      expect(actual).toEqual({
        props: {
          actions: uneListeDActionsAQualifier(),
          metadonneesActions: { nombreTotal: 5, nombrePages: 1 },
          pageTitle: 'Pilotage',
        },
      })
    })
  })
})
