import { render } from '@testing-library/react'

import RendezVousPasses, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/page'
import RendezVousPassesPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/RendezVousPassesPage'
import { unEvenementListItem } from 'fixtures/evenement'
import { unDetailJeune } from 'fixtures/jeune'
import { getRendezVousJeune } from 'services/evenements.service'
import { getJeuneDetails } from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/rendez-vous-passes/RendezVousPassesPage'
)
jest.mock('services/evenements.service')
jest.mock('services/jeunes.service')

describe('RendezVousPassesPage server side', () => {
  beforeEach(async () => {
    // Given
    ;(getRendezVousJeune as jest.Mock).mockResolvedValue([
      unEvenementListItem(),
    ])
    ;(getJeuneDetails as jest.Mock).mockResolvedValue(unDetailJeune())
  })

  describe('quand le conseiller n’est pas Pôle emploi', () => {
    it('récupère les rendez-vous passés d’un jeune avec son conseiller', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
        accessToken: 'accessToken',
        user: { id: 'id-conseiller', structure: 'MILO' },
      })

      // When
      const params = { idJeune: 'id-jeune' }
      const metadata = await generateMetadata({ params })
      render(await RendezVousPasses({ params }))

      // Then
      expect(getJeuneDetails).toHaveBeenCalledWith('id-jeune', 'accessToken')
      expect(getRendezVousJeune).toHaveBeenCalledWith(
        'id-jeune',
        'PASSES',
        'accessToken'
      )
      expect(metadata).toEqual({ title: 'Rendez-vous passés - Jirac Kenji' })
      expect(RendezVousPassesPage).toHaveBeenCalledWith(
        {
          beneficiaire: unDetailJeune(),
          rdvs: [unEvenementListItem()],
          lectureSeule: false,
        },
        {}
      )
    })
  })

  describe('quand le conseiller est Pôle emploi', () => {
    it('ne recupère pas les rendez-vous', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
        user: { structure: 'POLE_EMPLOI' },
      })

      // When
      render(await RendezVousPasses({ params: { idJeune: 'id-jeune' } }))

      // Then
      expect(getRendezVousJeune).not.toHaveBeenCalled()
      expect(RendezVousPassesPage).toHaveBeenCalledWith(
        expect.objectContaining({ rdvs: [] }),
        {}
      )
    })
  })
})
