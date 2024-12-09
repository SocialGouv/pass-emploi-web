import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'

import EmargementRdvPage from 'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
import EmargementRdv, {
  generateMetadata,
} from 'app/(connected)/(full-page)/emargement/[idEvenement]/page'
import { unConseiller } from 'fixtures/conseiller'
import { unEvenement } from 'fixtures/evenement'
import { unDetailSession } from 'fixtures/session'
import { StructureConseiller } from 'interfaces/conseiller'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getDetailsEvenement } from 'services/evenements.service'
import { getDetailsSession } from 'services/sessions.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock(
  'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
)
jest.mock('services/conseiller.service')
jest.mock('services/sessions.service')
jest.mock('services/evenements.service')

describe('EmargementRdvPage server side', () => {
  const acAEmarger = unEvenement({
    titre: 'Meeting de la famille Pirate',
  })

  const sessionAEmarger = unDetailSession()

  const conseiller = unConseiller({
    structure: StructureConseiller.MILO,
    structureMilo: { id: 'id-agence', nom: 'Montastruc-la-Conseillère' },
  })

  beforeEach(() => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { id: 'id-conseiller', structure: StructureConseiller.MILO },
      accessToken: 'accessToken',
    })
    ;(getDetailsEvenement as jest.Mock).mockResolvedValue(acAEmarger)
    ;(getDetailsSession as jest.Mock).mockResolvedValue(sessionAEmarger)
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
  })

  describe('Quand l’événement est une ac', () => {
    it('prépare la page', async () => {
      // When
      const metadata = await generateMetadata({
        params: Promise.resolve({ idEvenement: 'id-evenement' }),
        searchParams: Promise.resolve({ type: 'ac' }),
      })

      render(
        await EmargementRdv({
          params: Promise.resolve({ idEvenement: 'id-evenement' }),
          searchParams: Promise.resolve({ type: 'ac' }),
        })
      )

      // Then
      expect(metadata).toEqual({
        title: 'Emargement - Meeting de la famille Pirate',
      })

      expect(EmargementRdvPage).toHaveBeenCalledWith(
        {
          evenement: acAEmarger,
          agence: 'Montastruc-la-Conseillère',
        },
        undefined
      )
    })
  })

  describe('Quand l’événement est une session', () => {
    it('prépare la page', async () => {
      // When
      const metadata = await generateMetadata({
        params: Promise.resolve({ idEvenement: 'id-evenement' }),
        searchParams: Promise.resolve({ type: 'session' }),
      })

      render(
        await EmargementRdv({
          params: Promise.resolve({ idEvenement: 'id-evenement' }),
          searchParams: Promise.resolve({ type: 'session' }),
        })
      )

      // Then
      expect(metadata).toEqual({
        title: `Emargement - ${sessionAEmarger.session.nom}`,
      })

      expect(EmargementRdvPage).toHaveBeenCalledWith(
        {
          evenement: sessionAEmarger,
          agence: 'Montastruc-la-Conseillère',
        },
        undefined
      )
    })
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
      const promise = EmargementRdv({
        params: Promise.resolve({ idEvenement: 'id-evenement' }),
        searchParams: Promise.resolve({ type: 'ac' }),
      })

      //Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT REDIRECT /mes-jeunes')
      )
      expect(redirect).toHaveBeenCalledWith('/mes-jeunes')
    })
  })
})
