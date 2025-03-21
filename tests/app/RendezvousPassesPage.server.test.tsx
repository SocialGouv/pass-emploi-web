import { render } from '@testing-library/react'

import RendezVousPasses, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/page'
import RendezVousPassesPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/RendezVousPassesPage'
import { unDetailBeneficiaire } from 'fixtures/beneficiaire'
import { unEvenementListItem } from 'fixtures/evenement'
import { getJeuneDetails } from 'services/beneficiaires.service'
import { getRendezVousJeune } from 'services/evenements.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/RendezVousPassesPage'
)
jest.mock('services/evenements.service')
jest.mock('services/beneficiaires.service')

describe('RendezVousPassesPage server side', () => {
  beforeEach(async () => {
    // Given
    ;(getRendezVousJeune as jest.Mock).mockResolvedValue([
      unEvenementListItem(),
    ])
    ;(getJeuneDetails as jest.Mock).mockResolvedValue(unDetailBeneficiaire())
  })

  describe('quand le conseiller n’est pas France Travail', () => {
    it('récupère les rendez-vous passés d’un jeune avec son conseiller', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
        accessToken: 'accessToken',
        user: { id: 'id-conseiller-1', structure: 'MILO' },
      })

      // When
      const params = { idJeune: 'id-jeune' }
      const metadata = await generateMetadata({
        params: Promise.resolve(params),
      })
      render(await RendezVousPasses({ params: Promise.resolve(params) }))

      // Then
      expect(getJeuneDetails).toHaveBeenCalledWith('id-jeune', 'accessToken')
      expect(getRendezVousJeune).toHaveBeenCalledWith(
        'id-jeune',
        'PASSES',
        'accessToken'
      )
      expect(metadata).toEqual({ title: 'Rendez-vous passés - Jirac Kenji' })
      expect(RendezVousPassesPage).toHaveBeenCalledWith(
        { beneficiaire: unDetailBeneficiaire(), rdvs: [unEvenementListItem()] },
        undefined
      )
    })
  })

  describe('quand le conseiller est France Travail', () => {
    it('ne recupère pas les rendez-vous', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
        user: { structure: 'POLE_EMPLOI' },
      })

      // When
      render(
        await RendezVousPasses({
          params: Promise.resolve({ idJeune: 'id-jeune' }),
        })
      )

      // Then
      expect(getRendezVousJeune).not.toHaveBeenCalled()
      expect(RendezVousPassesPage).toHaveBeenCalledWith(
        expect.objectContaining({ rdvs: [] }),
        undefined
      )
    })
  })
})
