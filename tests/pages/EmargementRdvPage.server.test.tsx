import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'

import EmargementRdvPage from 'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
import EmargementRdv, {
  generateMetadata,
} from 'app/(connected)/(full-page)/emargement/[idEvenement]/page'
import { unEvenement } from 'fixtures/evenement'
import { StructureConseiller } from 'interfaces/conseiller'
import { getDetailsEvenement } from 'services/evenements.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock(
  'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
)
jest.mock('services/evenements.service')

describe('EmargementRdvPage server side', () => {
  const evenementAEmarger = unEvenement({
    titre: 'Meeting de la famille Pirate',
  })
  beforeEach(() => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { id: 'id-conseiller' },
      accessToken: 'accessToken',
    })
    ;(getDetailsEvenement as jest.Mock).mockResolvedValue(evenementAEmarger)
  })

  it('prépare la page', async () => {
    // When
    const metadata = await generateMetadata({
      params: { idEvenement: 'id-evenement' },
    })
    render(
      await EmargementRdv({
        params: { idEvenement: 'id-evenement' },
      })
    )

    // Then
    expect(metadata).toEqual({
      title: 'Emargement - Meeting de la famille Pirate',
    })
    expect(EmargementRdvPage).toHaveBeenCalledWith(
      {
        evenement: evenementAEmarger,
      },
      {}
    )
  })

  describe('Quand le conseiller est France Travail', () => {
    it('redirige vers le portefeuille', async () => {
      //Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: {
          id: 'id-conseiller',
          structure: StructureConseiller.POLE_EMPLOI,
        },
        accessToken: 'accessToken',
      })

      // When
      const promise = EmargementRdv({ params: { idEvenement: 'id-evenement' } })

      //Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT REDIRECT /mes-jeunes')
      )
      expect(redirect).toHaveBeenCalledWith('/mes-jeunes')
    })
  })
})
