import { render, screen, within } from '@testing-library/react'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'

import { desSituationsNonProfessionnelles, uneAction } from 'fixtures/action'
import { mockedActionsService } from 'fixtures/services'
import {
  Action,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import PageQualification, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions/[action_id]/qualification'
import { ActionsService } from 'services/actions.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe("Page Qualification d'une action", () => {
  describe('server side', () => {
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

    describe("quand le conseiller n'est pas MiLo", () => {
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

    describe('quand le conseiller est MiLo', () => {
      beforeEach(() => {
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            accessToken: 'accessToken',
            user: { structure: 'MILO' },
          },
        })
      })

      describe("quand l'action n'existe pas", () => {
        it('renvoie une 404', async () => {
          const actionsService: ActionsService = mockedActionsService({
            getAction: jest.fn(async () => undefined),
          })
          ;(withDependance as jest.Mock).mockReturnValue(actionsService)

          // When
          const actual: GetServerSidePropsResult<any> =
            await getServerSideProps({
              query: { action_id: 'id-action' },
            } as unknown as GetServerSidePropsContext)

          // Then
          expect(actual).toEqual({ notFound: true })
        })
      })

      describe("quand l'action n'est pas terminée", () => {
        it('renvoie une 404', async () => {
          const actionsService: ActionsService = mockedActionsService({
            getAction: jest.fn(async () => ({
              action: uneAction(),
              jeune: {
                id: 'jeune-1',
                prenom: 'Nadia',
                nom: 'Sanfamiye',
              },
            })),
          })
          ;(withDependance as jest.Mock).mockReturnValue(actionsService)

          // When
          const actual: GetServerSidePropsResult<any> =
            await getServerSideProps({
              query: { action_id: 'id-action' },
            } as unknown as GetServerSidePropsContext)

          // Then
          expect(actual).toEqual({ notFound: true })
        })
      })

      describe("quand l'action est qualifiée", () => {
        it('renvoie une 404', async () => {
          const actionsService: ActionsService = mockedActionsService({
            getAction: jest.fn(async () => ({
              action: uneAction({
                status: StatutAction.Terminee,
                qualification: {
                  libelle: 'Santé',
                  isSituationNonProfessionnelle: true,
                },
              }),
              jeune: {
                id: 'jeune-1',
                prenom: 'Nadia',
                nom: 'Sanfamiye',
              },
            })),
          })
          ;(withDependance as jest.Mock).mockReturnValue(actionsService)

          // When
          const actual: GetServerSidePropsResult<any> =
            await getServerSideProps({
              query: { action_id: 'id-action' },
            } as unknown as GetServerSidePropsContext)

          // Then
          expect(actual).toEqual({ notFound: true })
        })
      })

      describe("quand l'action est terminée", () => {
        it('récupère la liste des situations non professionnelles', async () => {
          // Given
          const action = uneAction({ status: StatutAction.Terminee })
          const situationsNonProfessionnelles =
            desSituationsNonProfessionnelles()
          const actionsService: ActionsService = mockedActionsService({
            getAction: jest.fn(async () => ({
              action,
              jeune: {
                id: 'jeune-1',
                prenom: 'Nadia',
                nom: 'Sanfamiye',
              },
            })),
            getSituationsNonProfessionnelles: jest.fn(
              async () => situationsNonProfessionnelles
            ),
          })
          ;(withDependance as jest.Mock).mockReturnValue(actionsService)

          // When
          const actual = await getServerSideProps({
            query: { action_id: action.id },
          } as unknown as GetServerSidePropsContext)

          // Then
          expect(actionsService.getAction).toHaveBeenCalledWith(
            action.id,
            'accessToken'
          )
          expect(
            actionsService.getSituationsNonProfessionnelles
          ).toHaveBeenCalledWith('accessToken')
          expect(actual).toEqual({
            props: {
              action,
              situationsNonProfessionnelles,
              pageTitle: 'Création d’une situation non professionnelle',
              returnTo: '/mes-jeunes/jeune-1/actions/id-action-1',
              withoutChat: true,
            },
          })
        })
      })
    })
  })

  describe('client side', () => {
    let action: Action
    let situationsNonProfessionnelles: SituationNonProfessionnelle[]
    beforeEach(() => {
      // Given
      action = uneAction({ dateFinReelle: '2022-09-02T11:00:00.000Z' })
      situationsNonProfessionnelles = desSituationsNonProfessionnelles()

      // When
      render(
        <PageQualification
          action={action}
          situationsNonProfessionnelles={situationsNonProfessionnelles}
          pageTitle=''
        />
      )
    })

    it("affiche le résumé de l'action", () => {
      // Then
      const etape1 = screen.getByRole('group', {
        name: "Étape 1 Résumé de l'action",
      })
      expect(within(etape1).getByText(action.content)).toBeInTheDocument()
      expect(within(etape1).getByText(action.comment)).toBeInTheDocument()
    })

    it('demande un type de situation non professionnelle', () => {
      // Then
      const etape2 = screen.getByRole('group', {
        name: 'Étape 2 Type',
      })
      const selectSNP = within(etape2).getByRole('combobox', { name: 'Type' })
      situationsNonProfessionnelles.forEach(({ code, label }) => {
        expect(
          within(selectSNP).getByRole('option', { name: label })
        ).toHaveValue(code)
      })
    })

    it("permet de modifier la date de fin réelle de l'action", () => {
      // Then
      const etape3 = screen.getByRole('group', {
        name: 'Étape 3 Date de fin de l’action',
      })
      const inputDate = within(etape3).getByLabelText('* Date')
      expect(inputDate).toHaveAttribute('type', 'date')
      expect(inputDate).toHaveAttribute('min', '2022-02-15')
      expect(inputDate).toHaveValue('2022-09-02')
    })
  })
})
