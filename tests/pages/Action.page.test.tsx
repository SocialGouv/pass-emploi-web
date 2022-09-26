import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unCommentaire, uneAction } from 'fixtures/action'
import { mockedActionsService } from 'fixtures/services'
import { Action, StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import { BaseJeune } from 'interfaces/jeune'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import PageAction, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions/[action_id]'
import { ActionsService } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'
import { DateTime } from "luxon";

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('next/router')

describe("Page Détail d'une action d'un jeune", () => {
  describe('client side', () => {
    describe('render', () => {
      const action = uneAction()
      const commentaires = [unCommentaire({ id: 'id-commentaire-3' })]
      const jeune: BaseJeune = {
        id: 'jeune-1',
        prenom: 'Nadia',
        nom: 'Sanfamiye',
      }
      let actionsService: ActionsService
      let routerPush: Function

      beforeEach(async () => {
        routerPush = jest.fn()
        actionsService = mockedActionsService({
          updateAction: jest.fn((_, statut) => Promise.resolve(statut)),
          deleteAction: jest.fn(),
        })
        ;(useRouter as jest.Mock).mockReturnValue({
          push: routerPush,
        })
        renderWithContexts(
          <PageAction
            action={action}
            jeune={jeune}
            commentaires={commentaires}
            pageTitle=''
          />,
          { customDependances: { actionsService } }
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
            StatutAction.Commencee
          )
        })
      })

      describe("A l'ajout de commentaire", () => {
        describe("quand c'est un succès", () => {
          it('affiche un message de succès', async () => {
            // Given
            actionsService.ajouterCommentaire = jest
              .fn()
              .mockResolvedValue(unCommentaire())
            const textbox = screen.getByRole('textbox')
            fireEvent.change(textbox, { target: { value: 'test' } })
            const submitButton = screen.getByRole('button', {
              name: 'Ajouter un commentaire',
            })

            // When
            await userEvent.click(submitButton)

            // Then
            expect(actionsService.ajouterCommentaire).toHaveBeenCalledWith(
              'id-action-1',
              'test'
            )
            expect(routerPush).toHaveBeenCalledWith({
              pathname: '/mes-jeunes/jeune-1/actions/id-action-1',
              query: {
                ajoutCommentaireAction: 'succes',
              },
            })
          })

          it('ne permet pas de supprimer l’action', () => {
            expect(
              screen.queryByRole('button', { name: 'Supprimer l’action' })
            ).not.toBeInTheDocument()
          })
        })

        describe("quand c'est un échec", () => {
          it('affiche une alerte', async () => {
            // Given
            actionsService.ajouterCommentaire = jest.fn().mockRejectedValue({})
            const textbox = screen.getByRole('textbox')
            fireEvent.change(textbox, { target: { value: 'test' } })
            const submitButton = screen.getByRole('button', {
              name: 'Ajouter un commentaire',
            })

            // When
            await userEvent.click(submitButton)

            // Then
            await waitFor(() => screen.getByRole('alert'))
            expect(screen.getByRole('alert')).toBeInTheDocument()
          })
        })
      })
    })

    describe("quand l'action est terminée et non qualifiée", () => {
      describe('quand le conseiller est MiLo', () => {
        const actionAQualifier = uneAction({
          status: StatutAction.Terminee,
        })
        const jeune: BaseJeune = {
          id: 'jeune-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
        }
        let actionsService: ActionsService
        let push: jest.Mock
        let replace: jest.Mock
        beforeEach(async () => {
          actionsService = mockedActionsService({
            qualifier: jest.fn().mockResolvedValue({
              libelle: 'PAS Situation Non Professionnelle',
              isSituationNonProfessionnelle: false,
            }),
          })

          push = jest.fn()
          replace = jest.fn()
          ;(useRouter as jest.Mock).mockReturnValue({ push, replace })

          renderWithContexts(
            <PageAction
              action={actionAQualifier}
              jeune={jeune}
              commentaires={[]}
              pageTitle=''
            />,
            {
              customDependances: { actionsService },
              customConseiller: { structure: StructureConseiller.MILO },
            }
          )
        })

        it("affiche un bloc pour qualifier l'action", async () => {
          expect(
            screen.getByText('S’agit-il d’une Situation Non Professionnelle ?')
          ).toBeInTheDocument()
        })

        describe("quand on qualifie l'action qui n'est PAS une Situation Non Professionnelle", () => {
          beforeEach(async () => {
            // Given
            const radioButton = screen.getByLabelText(
              'Il ne s’agit pas d’une Situation Non Professionnelle'
            )
            await userEvent.click(radioButton)

            // When
            const submitQualification = screen.getByRole('button', {
              name: /Enregistrer/,
            })
            await userEvent.click(submitQualification)
          })

          it("qualifie l'action", () => {
            expect(actionsService.qualifier).toHaveBeenCalledWith(
              actionAQualifier.id,
              CODE_QUALIFICATION_NON_SNP,
              DateTime.fromISO(actionAQualifier.dateEcheance),
              DateTime.fromISO(actionAQualifier.dateEcheance)
            )
          })

          it("met à jour le tag de l'action", () => {
            expect(
              screen.getByText('PAS Situation Non Professionnelle')
            ).toBeInTheDocument()
          })

          it('cache le formulaire de qualification', () => {
            expect(() =>
              screen.getByText(
                'S’agit-il d’une Situation Non Professionnelle ?'
              )
            ).toThrow()
          })

          it('affiche une alerte de succès', () => {
            expect(replace).toHaveBeenCalledWith(
              `/mes-jeunes/${jeune.id}/actions/${actionAQualifier.id}?qualificationNonSNP=succes`,
              undefined,
              { shallow: true }
            )
          })
        })

        describe("quand on qualifie l'action en Situation Non Professionnelle", () => {
          beforeEach(async () => {
            // Given
            const radioButton = screen.getByLabelText(
              'Il s’agit d’une Situation Non Professionnelle'
            )
            await userEvent.click(radioButton)

            // When
            const submitQualification = screen.getByRole('button', {
              name: /Enregistrer/,
            })
            await userEvent.click(submitQualification)
          })

          it('redirige vers la page de qualification', () => {
            expect(push).toHaveBeenCalledWith(
              `/mes-jeunes/${jeune.id}/actions/${actionAQualifier.id}/qualification`
            )
          })
        })
      })

      describe("quand le conseiller n'est pas MiLo", () => {
        const actionAQualifier = uneAction({
          status: StatutAction.Terminee,
        })
        const jeune: BaseJeune = {
          id: 'jeune-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
        }
        beforeEach(async () => {
          renderWithContexts(
            <PageAction
              action={actionAQualifier}
              jeune={jeune}
              commentaires={[]}
              pageTitle=''
            />,
            {
              customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
            }
          )
        })

        it("n'affiche pas de bloc pour qualifier l'action", async () => {
          expect(() =>
            screen.getByText('S’agit-il d’une Situation Non Professionnelle ?')
          ).toThrow()
        })

        it('ne permet pas de supprimer l’action', () => {
          expect(
            screen.queryByRole('button', { name: 'Supprimer l’action' })
          ).not.toBeInTheDocument()
        })

        it('ne permet pas de modifier le statut de l’action', () => {
          expect(screen.getByLabelText('À réaliser')).toHaveAttribute(
            'disabled'
          )
          expect(screen.getByLabelText('Commencée')).toHaveAttribute('disabled')
          expect(screen.getByLabelText('Annulée')).toHaveAttribute('disabled')
        })
      })
    })
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
        const commentaires = [unCommentaire()]
        const jeune: BaseJeune = {
          id: 'jeune-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
        }
        const actionsService: ActionsService = mockedActionsService({
          getAction: jest.fn(async () => ({ action, jeune })),
          recupererLesCommentaires: jest.fn(async () => commentaires),
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
        const pageTitle = `Portefeuille - Actions de ${jeune.prenom} ${jeune.nom} - ${action.content}`
        expect(actual).toEqual({
          props: {
            action,
            jeune,
            commentaires,
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
