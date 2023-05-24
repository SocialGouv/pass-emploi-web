import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unCommentaire, uneAction } from 'fixtures/action'
import { unDetailJeune } from 'fixtures/jeune'
import { Action, StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import { BaseJeune } from 'interfaces/jeune'
import { CODE_QUALIFICATION_NON_SNP } from 'interfaces/json/action'
import PageAction, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions/[action_id]'
import { AlerteParam } from 'referentiel/alerteParam'
import {
  ajouterCommentaire,
  deleteAction,
  getAction,
  qualifier,
  recupererLesCommentaires,
  updateAction,
} from 'services/actions.service'
import { getJeuneDetails } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('next/router')
jest.mock('services/actions.service')
jest.mock('services/jeunes.service')
jest.mock('components/PageActionsPortal')

describe("Page Détail d'une action d'un jeune", () => {
  describe('client side', () => {
    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    let routerPush: Function
    const action = uneAction()
    const commentaires = [unCommentaire({ id: 'id-commentaire-3' })]
    const jeune: BaseJeune & { idConseiller: string } = {
      id: 'jeune-1',
      prenom: 'Nadia',
      nom: 'Sanfamiye',
      idConseiller: 'id-conseiller',
    }

    beforeEach(() => {
      alerteSetter = jest.fn()
      routerPush = jest.fn()
      ;(updateAction as jest.Mock).mockImplementation(
        async (_, statut) => statut
      )
      ;(deleteAction as jest.Mock).mockResolvedValue({})
      ;(useRouter as jest.Mock).mockReturnValue({
        push: routerPush,
      })
    })

    describe('render', () => {
      beforeEach(async () => {
        renderWithContexts(
          <PageAction
            action={action}
            jeune={jeune}
            commentaires={commentaires}
            lectureSeule={false}
            pageTitle=''
          />,
          {
            customAlerte: { alerteSetter },
          }
        )
      })

      it("affiche les information d'une action", () => {
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
          expect(updateAction).toHaveBeenCalledWith(
            action.id,
            StatutAction.Commencee
          )
        })
      })

      describe("A l'ajout de commentaire", () => {
        describe("quand c'est un succès", () => {
          it('affiche un message de succès', async () => {
            // Given
            ;(ajouterCommentaire as jest.Mock).mockResolvedValue(
              unCommentaire()
            )
            const textbox = screen.getByRole('textbox')
            fireEvent.change(textbox, { target: { value: 'test' } })
            const submitButton = screen.getByRole('button', {
              name: 'Ajouter un commentaire',
            })

            // When
            await userEvent.click(submitButton)

            // Then
            expect(ajouterCommentaire).toHaveBeenCalledWith(
              'id-action-1',
              'test'
            )
            expect(alerteSetter).toHaveBeenCalledWith('ajoutCommentaireAction')
            expect(routerPush).toHaveBeenCalledWith(
              '/mes-jeunes/jeune-1/actions/id-action-1'
            )
            expect(textbox).toHaveValue('')
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
            ;(ajouterCommentaire as jest.Mock).mockRejectedValue({})
            const textbox = screen.getByRole('textbox')
            fireEvent.change(textbox, { target: { value: 'test' } })
            const submitButton = screen.getByRole('button', {
              name: 'Ajouter un commentaire',
            })

            // When
            await userEvent.click(submitButton)

            // Then
            expect(screen.getByRole('alert')).toBeInTheDocument()
          })
        })
      })
    })

    describe("quand le conseiller n'est pas le conseiller du jeune", () => {
      ;(updateAction as jest.Mock).mockImplementation(
        async (_, statut) => statut
      )
      ;(deleteAction as jest.Mock).mockResolvedValue({})

      beforeEach(async () => {
        renderWithContexts(
          <PageAction
            action={action}
            jeune={jeune}
            commentaires={commentaires}
            pageTitle=''
            lectureSeule={true}
          />,
          {
            customAlerte: { alerteSetter },
            customConseiller: { id: 'fake-id' },
          }
        )
      })

      it('affiche un encart lecture seule si ce n‘est pas le conseiller du jeune', async () => {
        //Then
        expect(
          screen.getByText('Vous êtes en lecture seule')
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            'Vous pouvez uniquement lire le détail de l’action de ce bénéficiaire car il ne fait pas partie de votre portefeuille.'
          )
        ).toBeInTheDocument()
      })

      it('désactive tous les boutons radio', async () => {
        const radioButtons = screen.getAllByRole('radio')
        radioButtons.forEach((radioBtn) => {
          expect(radioBtn).toHaveAttribute('disabled')
        })
      })

      it("n'affiche pas l'encart de création de commentaire", async () => {
        expect(() =>
          screen.getByText('Commentaire à destination du jeune')
        ).toThrow()
        expect(() => screen.getByLabelText('Ajouter un commentaire')).toThrow()
        expect(() => screen.getByText('Ajouter un commentaire')).toThrow()
      })

      it("n'affiche pas l'encart: s’agit-il d’une SNP ?", async () => {
        expect(() =>
          screen.getByText('S’agit-il d’une Situation Non Professionnelle ?')
        ).toThrow()
      })
    })

    describe('quand l’action n’a pas de commentaires', () => {
      it('permet de supprimer l’action', async () => {
        // Given
        const action = uneAction()
        renderWithContexts(
          <PageAction
            action={action}
            jeune={jeune}
            commentaires={[]}
            lectureSeule={false}
            pageTitle=''
          />,
          {
            customAlerte: { alerteSetter },
          }
        )

        // When
        await userEvent.click(
          screen.getByRole('button', { name: "Supprimer l'action" })
        )

        // Then
        expect(deleteAction).toHaveBeenCalledWith(action.id)
      })
    })

    describe("quand l'action est terminée et non qualifiée", () => {
      describe('quand le conseiller est MiLo', () => {
        const actionAQualifier = uneAction({
          status: StatutAction.Terminee,
        })
        const jeune: BaseJeune & { idConseiller: string } = {
          id: 'jeune-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
          idConseiller: 'id-conseiller',
        }

        beforeEach(async () => {
          ;(qualifier as jest.Mock).mockResolvedValue({
            libelle: 'PAS Situation Non Professionnelle',
            isSituationNonProfessionnelle: false,
          })
          ;(useRouter as jest.Mock).mockReturnValue({ push: routerPush })

          renderWithContexts(
            <PageAction
              action={actionAQualifier}
              jeune={jeune}
              commentaires={[]}
              lectureSeule={false}
              pageTitle=''
            />,
            {
              customConseiller: { structure: StructureConseiller.MILO },
              customAlerte: { alerteSetter },
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
            expect(qualifier).toHaveBeenCalledWith(
              actionAQualifier.id,
              CODE_QUALIFICATION_NON_SNP,
              {
                dateDebutModifiee: DateTime.fromISO(
                  actionAQualifier.dateEcheance
                ),
                dateFinModifiee: DateTime.fromISO(
                  actionAQualifier.dateEcheance
                ),
              }
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
            expect(alerteSetter).toHaveBeenCalledWith('qualificationNonSNP')
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
            expect(routerPush).toHaveBeenCalledWith(
              `/mes-jeunes/${jeune.id}/actions/${actionAQualifier.id}/qualification`
            )
          })
        })
      })

      describe("quand le conseiller n'est pas MiLo", () => {
        const actionAQualifier = uneAction({
          status: StatutAction.Terminee,
        })
        const jeune: BaseJeune & { idConseiller: string } = {
          id: 'jeune-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
          idConseiller: 'id-conseiller',
        }
        beforeEach(async () => {
          renderWithContexts(
            <PageAction
              action={actionAQualifier}
              jeune={jeune}
              commentaires={[]}
              lectureSeule={false}
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
            user: { structure: 'MILO', id: 'id-conseiller' },
          },
        })
        const action: Action = uneAction()
        const commentaires = [unCommentaire()]
        const jeune: BaseJeune & { idConseiller: string } = {
          id: 'jeune-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
          idConseiller: 'id-conseiller',
        }
        ;(getAction as jest.Mock).mockResolvedValue({ action, jeune })
        ;(recupererLesCommentaires as jest.Mock).mockResolvedValue(commentaires)
        ;(getJeuneDetails as jest.Mock).mockResolvedValue(unDetailJeune())

        // When
        const actual: GetServerSidePropsResult<any> = await getServerSideProps({
          query: {
            action_id: 'id-action',
            envoiMessage: 'succes',
            jeune_id: 'jeune-1',
          },
        } as unknown as GetServerSidePropsContext) // Then
        expect(getAction).toHaveBeenCalledWith('id-action', 'accessToken')
        const pageTitle = `Portefeuille - Actions de ${jeune.prenom} ${jeune.nom} - ${action.content}`
        const lectureSeule = false
        expect(actual).toEqual({
          props: {
            action,
            jeune,
            commentaires,
            lectureSeule: false,
            pageTitle,
            pageHeader: 'Détails de l’action',
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

        // When
        let actual: GetServerSidePropsResult<any> = await getServerSideProps({
          query: { action_id: 'id-action', envoiMessage: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({ notFound: true })
      })
    })

    describe("quand l'action n'appartient pas au jeune", () => {
      it('renvoie une 404', async () => {
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            accessToken: 'accessToken',
            user: { structure: 'MILO' },
          },
        })
        const action: Action = uneAction()
        const commentaires = [unCommentaire()]
        const jeune: BaseJeune & { idConseiller: string } = {
          id: 'jeune-1',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
          idConseiller: 'id-conseiller',
        }
        ;(getAction as jest.Mock).mockResolvedValue({ action, jeune })
        ;(recupererLesCommentaires as jest.Mock).mockResolvedValue(commentaires)

        // When
        let actual: GetServerSidePropsResult<any> = await getServerSideProps({
          query: {
            action_id: 'id-action',
            envoiMessage: 'succes',
            jeune_id: 'FAKE_ID',
          },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({ notFound: true })
      })
    })
  })
})
