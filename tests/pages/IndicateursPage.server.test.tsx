import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'

import IndicateursPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/indicateurs/IndicateursPage'
import Indicateurs, {
  generateMetadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/indicateurs/page'
import { unDetailJeune } from 'fixtures/jeune'
import { getJeuneDetails } from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock('services/jeunes.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/indicateurs/IndicateursPage'
)

describe('IndicateursPage server side', () => {
  describe('Pour un conseiller Pole Emploi', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: 'POLE_EMPLOI' },
      })

      // When
      const promise = Indicateurs({ params: { idJeune: 'id-jeune' } })

      // Then

      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  it('prépare la page', async () => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { structure: 'MILO', id: 'id-conseiller' },
    })
    ;(getJeuneDetails as jest.Mock).mockResolvedValue(unDetailJeune())

    // When
    const params = { idJeune: 'id-jeune' }
    const metadata = await generateMetadata({ params })
    render(await Indicateurs({ params }))

    // Then
    expect(metadata).toEqual({
      title: 'Indicateurs - Jirac Kenji - Portefeuille',
    })
    expect(IndicateursPage).toHaveBeenCalledWith(
      {
        idJeune: 'jeune-1',
        lectureSeule: false,
      },
      {}
    )
  })
})
