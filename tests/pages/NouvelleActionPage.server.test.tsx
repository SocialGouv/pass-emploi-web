import { render } from '@testing-library/react'

import NouvelleActionPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[jeune_id]/actions/nouvelle-action/NouvelleActionPage'
import NouvelleAction from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[jeune_id]/actions/nouvelle-action/page'
import { desSituationsNonProfessionnelles } from 'fixtures/action'
import { getSituationsNonProfessionnelles } from 'services/actions.service'
import { getActionsPredefinies } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock('services/actions.service')
jest.mock('services/referentiel.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[jeune_id]/actions/nouvelle-action/NouvelleActionPage',
  () => ({ __esModule: true, default: jest.fn(), TITRE_AUTRE: 'Autre' })
)

describe('NouvelleActionPage server side', () => {
  it('prépare la page', async () => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      accessToken: 'accessToken',
    })
    ;(getActionsPredefinies as jest.Mock).mockResolvedValue([
      {
        id: 'action-predefinie-1',
        titre: 'Identifier ses atouts et ses compétences',
      },
    ])
    ;(getSituationsNonProfessionnelles as jest.Mock).mockResolvedValue(
      desSituationsNonProfessionnelles()
    )

    // When
    render(
      await NouvelleAction({
        params: { jeune_id: 'id-jeune' },
      })
    )

    // Then
    expect(getActionsPredefinies).toHaveBeenCalledWith('accessToken')
    expect(NouvelleActionPage).toHaveBeenCalledWith(
      {
        idJeune: 'id-jeune',
        categories: desSituationsNonProfessionnelles(),
        actionsPredefinies: [
          {
            id: 'action-predefinie-1',
            titre: 'Identifier ses atouts et ses compétences',
          },
          { id: 'autre', titre: 'Autre' },
        ],
        returnTo: '/mes-jeunes/id-jeune?onglet=actions',
      },
      {}
    )
  })
})
