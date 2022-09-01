import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'

import { uneAction } from 'fixtures/action'
import { mockedActionsService } from 'fixtures/services'
import { StatutAction } from 'interfaces/action'
import { getServerSideProps } from 'pages/mes-jeunes/[jeune_id]/actions/[action_id]/qualification'
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

      describe("quand l'action est terminée", () => {
        it('récupère la liste des situations non professionnelles', async () => {
          // Given
          const situationsNonProfessionnelles = [
            { code: 'SNP_1', label: 'SNP 1' },
            { code: 'SNP_2', label: 'SNP 2' },
            { code: 'SNP_3', label: 'SNP 3' },
          ]
          const actionsService: ActionsService = mockedActionsService({
            getAction: jest.fn(async () => ({
              action: uneAction({ status: StatutAction.Terminee }),
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
            query: { action_id: 'id-action' },
          } as unknown as GetServerSidePropsContext)

          // Then
          expect(actual).toEqual({
            props: {
              situationsNonProfessionnelles: situationsNonProfessionnelles,
            },
          })
        })
      })
    })
  })
})
