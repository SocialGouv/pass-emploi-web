import { fireEvent, screen } from '@testing-library/react'
import { uneAction } from 'fixtures/action'
import { unJeune } from 'fixtures/jeune'
import { ActionStatus } from 'interfaces/action'
import { GetServerSidePropsContext } from 'next/types'
import Actions, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions'
import React from 'react'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import renderWithSession from '../renderWithSession'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

afterAll(() => jest.clearAllMocks())

describe("Page Liste des actions d'un jeune", () => {
  describe('pour un conseiller MiLo', () => {
    const actions = [
      uneAction({ id: 'action-1', content: 'action 1' }),
      uneAction({ id: 'action-2', content: 'action 2' }),
    ]
    const jeune = unJeune()
    const uneActionCommencee = uneAction({
      id: 'action-commencee',
      content: 'action commencée',
      status: ActionStatus.InProgress,
    })
    const uneActionTermine = uneAction({
      id: 'action-terminee',
      content: 'action terminee',
      status: ActionStatus.Done,
    })
    const uneActionAnnulee = uneAction({
      id: 'action-annulee',
      content: 'action annulee',
      status: ActionStatus.Canceled,
    })

    beforeEach(() => {
      renderWithSession(
        <Actions
          jeune={jeune}
          deleteSuccess={false}
          actions={[uneActionCommencee, uneActionTermine, ...actions]}
          actionsCommencees={[uneActionCommencee]}
          actionsARealiser={[...actions]}
          actionsTerminees={[uneActionTermine]}
          actionsAnnulees={[uneActionAnnulee]}
          pageTitle=''
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

      it("Affiche les actions terminees lorsqu'on clique sur le bouton terminee", async () => {
        //GIVEN
        const termineesFilterTab = screen.getByRole('tab', {
          name: 'Terminées (1)',
        })

        //WHEN
        fireEvent.click(termineesFilterTab)

        //THEN
        expect(screen.getByText(uneActionTermine.content)).toBeInTheDocument()
        expect(() => screen.getByText(uneActionCommencee.content)).toThrow()
        expect(() => screen.getByText(actions[0].content)).toThrow()
      })
    })
  })

  describe('Pour un conseiller Pole Emploi', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        session: {
          user: { structure: 'POLE_EMPLOI' },
        },
        validSession: true,
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ notFound: true })
    })
  })
})
