import { render } from '@testing-library/react'

import NouvelleActionPage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/nouvelle-action/NouvelleActionPage'
import NouvelleAction, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/nouvelle-action/page'
import { desCategories } from 'fixtures/action'
import { getSituationsNonProfessionnelles } from 'services/actions.service'
import { getIdentitesBeneficiairesServerSide } from 'services/jeunes.service'
import { getActionsPredefinies } from 'services/referentiel.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock('services/jeunes.service')
jest.mock('services/actions.service')
jest.mock('services/referentiel.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/[idJeune]/actions/nouvelle-action/NouvelleActionPage',
  () => ({ __esModule: true, default: jest.fn(), TITRE_AUTRE: 'Autre' })
)

describe('NouvelleActionPage server side', () => {
  it('prépare les métadonnées', async () => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { id: 'id-conseiller' },
      accessToken: 'accessToken',
    })
    ;(getIdentitesBeneficiairesServerSide as jest.Mock).mockResolvedValue([
      {
        id: 'id-beneficiaire',
        prenom: 'Serge',
        nom: 'Lama',
      },
    ])

    // When
    const metadata = await generateMetadata({
      params: { idJeune: 'id-beneficiaire' },
    })

    // Then
    expect(getIdentitesBeneficiairesServerSide).toHaveBeenCalledWith(
      ['id-beneficiaire'],
      'id-conseiller',
      'accessToken'
    )
    expect(metadata).toEqual({
      title: 'Créer une nouvelle action - Actions Serge Lama',
    })
  })

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
      desCategories()
    )

    // When
    render(
      await NouvelleAction({
        params: { idJeune: 'id-beneficiaire' },
      })
    )

    // Then
    expect(getActionsPredefinies).toHaveBeenCalledWith('accessToken')
    expect(NouvelleActionPage).toHaveBeenCalledWith(
      {
        idBeneficiaire: 'id-beneficiaire',
        categories: desCategories(),
        actionsPredefinies: [
          {
            id: 'action-predefinie-1',
            titre: 'Identifier ses atouts et ses compétences',
          },
        ],
        returnTo: '/mes-jeunes/id-beneficiaire?onglet=actions',
      },
      {}
    )
  })
})
