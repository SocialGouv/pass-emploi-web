import { fireEvent, screen } from '@testing-library/react'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import renderWithSession from '../renderWithSession'

import { uneAction, uneListeDActions } from 'fixtures/action'
import { unJeune } from 'fixtures/jeune'
import { mockedActionsService, mockedJeunesService } from 'fixtures/services'
import { ActionJeune, StatutAction } from 'interfaces/action'
import { Jeune } from 'interfaces/jeune'
import Actions, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions'
import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe("Page Liste des actions d'un jeune", () => {
  describe('client side', () => {
    const actions = [
      uneAction({ id: 'action-1', content: 'action 1' }),
      uneAction({ id: 'action-2', content: 'action 2' }),
    ]
    const jeune = unJeune()
    const uneActionCommencee = uneAction({
      id: 'action-commencee',
      content: 'action commencée',
      status: StatutAction.Commencee,
    })
    const uneActionTerminee = uneAction({
      id: 'action-terminee',
      content: 'action terminee',
      status: StatutAction.Terminee,
    })
    const uneActionAnnulee = uneAction({
      id: 'action-annulee',
      content: 'action annulee',
      status: StatutAction.Annulee,
    })

    beforeEach(() => {
      renderWithSession(
        <Actions
          jeune={jeune}
          actions={[
            ...actions,
            uneActionCommencee,
            uneActionTerminee,
            uneActionAnnulee,
          ]}
          pageTitle=''
          creationSuccess={true}
          suppressionSuccess={true}
        />
      )
    })

    it('affiche la liste des actions du jeune', () => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: `Les actions de ${jeune.firstName} ${jeune.lastName}`,
        })
      ).toBeInTheDocument()
      actions.forEach((action) => {
        expect(screen.getByText(action.content)).toBeInTheDocument()
        const lien = screen.getByLabelText(
          `Détail de l'action ${action.content}`
        ) as HTMLAnchorElement
        expect(lien).toBeInTheDocument()
        expect(lien).toHaveAttribute(
          'href',
          `/mes-jeunes/${jeune.id}/actions/${action.id}`
        )
      })
    })

    it('a un lien pour revenir sur la page précédente', () => {
      const backLink = screen
        .getByLabelText('Retour sur la fiche du jeune')
        .closest('a')
      expect(backLink).toBeInTheDocument()
      expect(backLink).toHaveAttribute('href', '/mes-jeunes/jeune-1')
    })

    it('a un lien pour créer une action', () => {
      expect(
        screen.getByRole('link', { name: 'Créer une nouvelle action' })
      ).toHaveAttribute('href', '/mes-jeunes/jeune-1/actions/nouvelle-action')
    })

    it("affiche le succès de la création d'une action", () => {
      // Then
      expect(screen.getByText("L'action a bien été créée")).toBeInTheDocument()
    })

    it("affiche le succès de la suppression d'une action", () => {
      // Then
      expect(
        screen.getByText("L'action a bien été supprimée")
      ).toBeInTheDocument()
    })

    describe("Filtres de la liste d'actions", () => {
      it('Affiche les boutons des filtres', () => {
        const selected = screen.getByRole('tab', { selected: true })
        expect(selected).toBeInTheDocument()
        expect(selected).toHaveAttribute('tabIndex', '-1')

        const notSelected = screen.getAllByRole('tab', { selected: false })
        expect(notSelected.length).toEqual(4)
        for (const filtre of notSelected) {
          expect(filtre).toHaveAttribute('tabIndex', '0')
        }
      })

      it("Affiche les actions non commencées lorsqu'on clique sur le bouton À réaliser", async () => {
        //GIVEN
        const aRealiserFilterTab = screen.getByRole('tab', {
          name: 'À réaliser (2)',
        })

        //WHEN
        fireEvent.click(aRealiserFilterTab)

        //THEN
        expect(screen.getByText(actions[0].content)).toBeInTheDocument()
        expect(screen.getByText(actions[1].content)).toBeInTheDocument()
        expect(() => screen.getByText(uneActionCommencee.content)).toThrow()
        expect(() => screen.getByText(uneActionTerminee.content)).toThrow()
        expect(() => screen.getByText(uneActionAnnulee.content)).toThrow()
      })

      it("Affiche les actions en cours lorsqu'on clique sur le bouton Commencées", async () => {
        //GIVEN
        const commenceesFilterTab = screen.getByRole('tab', {
          name: 'Commencées (1)',
        })

        //WHEN
        fireEvent.click(commenceesFilterTab)

        //THEN
        expect(screen.getByText(uneActionCommencee.content)).toBeInTheDocument()
        expect(() => screen.getByText(actions[0].content)).toThrow()
        expect(() => screen.getByText(actions[1].content)).toThrow()
        expect(() => screen.getByText(uneActionTerminee.content)).toThrow()
        expect(() => screen.getByText(uneActionAnnulee.content)).toThrow()
      })

      it("Affiche les actions terminees lorsqu'on clique sur le bouton Terminées", async () => {
        //GIVEN
        const termineesFilterTab = screen.getByRole('tab', {
          name: 'Terminées (1)',
        })

        //WHEN
        fireEvent.click(termineesFilterTab)

        //THEN
        expect(screen.getByText(uneActionTerminee.content)).toBeInTheDocument()
        expect(() => screen.getByText(actions[0].content)).toThrow()
        expect(() => screen.getByText(actions[1].content)).toThrow()
        expect(() => screen.getByText(uneActionCommencee.content)).toThrow()
        expect(() => screen.getByText(uneActionAnnulee.content)).toThrow()
      })

      it("Affiche les actions annulées lorsqu'on clique sur le bouton Annulées", async () => {
        //GIVEN
        const annuleesFilterTab = screen.getByRole('tab', {
          name: 'Annulées (1)',
        })

        //WHEN
        fireEvent.click(annuleesFilterTab)

        //THEN
        expect(screen.getByText(uneActionAnnulee.content)).toBeInTheDocument()
        expect(() => screen.getByText(actions[0].content)).toThrow()
        expect(() => screen.getByText(actions[1].content)).toThrow()
        expect(() => screen.getByText(uneActionCommencee.content)).toThrow()
        expect(() => screen.getByText(uneActionTerminee.content)).toThrow()
      })
    })
  })

  describe('server side', () => {
    it('nécessite une session valide', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: 'whatever',
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: 'whatever' })
    })

    describe("quand l'utilisateur est Pole emploi", () => {
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

    describe("quand l'utilisateur n'est pas Pole emploi", () => {
      let jeune: Jeune
      let actions: ActionJeune[]
      let jeunesService: JeunesService
      let actionsService: ActionsService
      let actual: GetServerSidePropsResult<any>
      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { structure: 'MILO' },
            accessToken: 'accessToken',
          },
        })

        jeune = unJeune()
        actions = uneListeDActions()
        jeunesService = mockedJeunesService({
          getJeuneDetails: jest.fn(async () => jeune),
        })
        actionsService = mockedActionsService({
          getActionsJeune: jest.fn(async () => actions),
        })
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'jeunesService') return jeunesService
          if (dependance === 'actionsService') return actionsService
        })

        // When
        actual = await getServerSideProps({
          query: {
            jeune_id: 'id-jeune',
            creation: 'succes',
            suppression: 'succes',
            envoiMessage: 'succes',
          },
        } as unknown as GetServerSidePropsContext)
      })

      it('récupère les infos du jeune', () => {
        // Then
        expect(jeunesService.getJeuneDetails).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { jeune, pageTitle: 'Mes jeunes - Actions de Kenji Jirac' },
        })
      })

      it('récupère les actions du jeune triées par dates', () => {
        // Then
        expect(jeunesService.getJeuneDetails).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { actions: [actions[2], actions[1], actions[0]] },
        })
      })

      it("récupère le résultat de la suppression d'une action", () => {
        // The
        expect(actual).toMatchObject({
          props: { suppressionSuccess: true },
        })
      })

      it("récupère le résultat de l'envoi d'un message groupé", () => {
        // The
        expect(actual).toMatchObject({
          props: { messageEnvoiGroupeSuccess: true },
        })
      })

      it("récupère le résultat de la cráetion d'une action", () => {
        // The
        expect(actual).toMatchObject({
          props: { creationSuccess: true },
        })
      })
    })
  })
})
