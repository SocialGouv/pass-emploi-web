import { screen } from '@testing-library/react'
import { uneAction } from 'fixtures/action'
import { unJeune } from 'fixtures/jeune'
import { GetServerSidePropsContext } from 'next/types'
import Actions, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/actions'
import React from 'react'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import renderWithSession from '../renderWithSession'

jest.mock('utils/withMandatorySessionOrRedirect')

afterAll(() => jest.clearAllMocks())

describe("Page Liste des actions d'un jeune", () => {
  describe('pour un conseiller MiLo', () => {
    const actions = [
      uneAction({ id: 'action-1', content: 'action 1' }),
      uneAction({ id: 'action-2', content: 'action 2' }),
    ]
    const jeune = unJeune()
    beforeEach(() => {
      renderWithSession(
        <Actions jeune={jeune} actionsEnCours={actions} deleteSuccess={false} />
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
        expect(screen.getByText(action.content).closest('a')).toHaveAttribute(
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
  })

  describe('Pour un conseiller Pole Emploi', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        session: {
          user: { structure: 'POLE_EMPLOI' },
        },
        hasSession: true,
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ notFound: true })
    })
  })
})
