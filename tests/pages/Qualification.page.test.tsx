import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
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
import { AlerteParam } from 'referentiel/alerteParam'
import { ActionsService } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('next/router')

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
              pageTitle: 'Actions jeune - Qualifier action',
              pageHeader: 'Créer une situation non professionnelle',
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
    let actionsService: ActionsService

    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    let push: jest.Mock
    beforeEach(() => {
      // Given
      action = uneAction({ dateFinReelle: '2022-09-02T11:00:00.000Z' })
      situationsNonProfessionnelles = desSituationsNonProfessionnelles()
      actionsService = mockedActionsService()

      alerteSetter = jest.fn()
      push = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({ push })

      // When
      renderWithContexts(
        <PageQualification
          action={action}
          situationsNonProfessionnelles={situationsNonProfessionnelles}
          pageTitle=''
          returnTo='/mes-jeunes/jeune-1/actions/id-action-1'
        />,
        {
          customDependances: { actionsService },
          customAlerte: { alerteSetter },
        }
      )
    })

    it('affiche un message d’information', async () => {
      // Then
      expect(
        screen.getByText(
          'Ces informations seront intégrées sur le dossier i-milo du jeune'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(/respecter les Conditions Générales d’utilisation/)
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: 'voir le détail des CGU (nouvelle fenêtre)',
        })
      ).toHaveAttribute(
        'href',
        'https://doc.pass-emploi.beta.gouv.fr/legal/web_conditions_generales'
      )
    })

    it("affiche le résumé de l'action", () => {
      // Then
      const etape1 = screen.getByRole('group', {
        name: "Étape 1 Résumé de l'action",
      })
      expect(
        within(etape1).getByRole('textbox', {
          name: /Titre et description de l'action/,
        })
      ).toHaveValue(action.content + ' - ' + action.comment)
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

    it("permet de modifier la date de début de l'action", () => {
      // Then
      const etape3 = screen.getByRole('group', {
        name: 'Étape 3 Date de début de l’action',
      })
      const inputDate = within(etape3).getByLabelText('* Date de début')
      expect(inputDate).toHaveAttribute('type', 'date')
      expect(inputDate).toHaveValue('2022-02-15')
    })

    it("permet de modifier la date de fin réelle de l'action", () => {
      // Then
      const etape4 = screen.getByRole('group', {
        name: 'Étape 4 Date de fin de l’action',
      })
      const inputDate = within(etape4).getByLabelText('* Date de fin')
      expect(inputDate).toHaveAttribute('type', 'date')
      expect(inputDate).toHaveAttribute('min', '2022-02-15')
      expect(inputDate).toHaveValue('2022-09-02')
    })

    describe('validation formulaire', () => {
      beforeEach(async () => {
        // Given
        const selectSNP = screen.getByRole('combobox', { name: 'Type' })
        const inputDate = screen.getByLabelText('* Date de fin')
        await userEvent.selectOptions(
          selectSNP,
          situationsNonProfessionnelles[1].code
        )
        // FIXME userEvent.type ne marche pas bien avec les input date/time
        fireEvent.change(inputDate, { target: { value: '2022-09-05' } })

        // When
        await userEvent.click(
          screen.getByRole('button', { name: 'Créer et envoyer à i-milo' })
        )
      })

      it('envoie la qualification au fuseau horaire du navigateur du client', async () => {
        // Then
        expect(actionsService.qualifier).toHaveBeenCalledWith(
          action.id,
          'SNP_2',
          DateTime.fromISO('2022-02-15T00:00:00.000+01:00'), // en février, l'offset est +1 (DST)
          DateTime.fromISO('2022-09-05T00:00:00.000+02:00')
        )
      })

      it("redirige vers le détail de l'action", () => {
        // Then
        expect(alerteSetter).toHaveBeenCalledWith('qualificationSNP')
        expect(push).toHaveBeenCalledWith(
          '/mes-jeunes/jeune-1/actions/id-action-1'
        )
      })
    })
  })
})
