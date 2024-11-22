import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import EmargementRdvPage from 'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
import EmargementRdv, {
  generateMetadata,
} from 'app/(connected)/(full-page)/emargement/[idEvenement]/page'
import { unUtilisateur } from 'fixtures/auth'
import { unConseiller } from 'fixtures/conseiller'
import { unEvenement } from 'fixtures/evenement'
import { unDetailSession } from 'fixtures/session'
import { StructureConseiller } from 'interfaces/conseiller'
import { getConseillerServerSide } from 'services/conseillers.service'
import { getDetailsEvenement } from 'services/evenements.service'
import { getDetailsSession } from 'services/sessions.service'

jest.mock(
  'app/(connected)/(full-page)/emargement/[idEvenement]/EmargementRdvPage'
)
jest.mock('services/conseillers.service')
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
    ;(getDetailsEvenement as jest.Mock).mockResolvedValue(acAEmarger)
    ;(getDetailsSession as jest.Mock).mockResolvedValue(sessionAEmarger)
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(conseiller)
  })

  describe('Quand l’événement est une ac', () => {
    it('prépare la page', async () => {
      // When
      const metadata = await generateMetadata({
        params: { idEvenement: 'id-evenement' },
        searchParams: { type: 'ac' },
      })

      render(
        await EmargementRdv({
          params: { idEvenement: 'id-evenement' },
          searchParams: { type: 'ac' },
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
        {}
      )
    })
  })

  describe('Quand l’événement est une session', () => {
    it('prépare la page', async () => {
      // When
      const metadata = await generateMetadata({
        params: { idEvenement: 'id-evenement' },
        searchParams: { type: 'session' },
      })

      render(
        await EmargementRdv({
          params: { idEvenement: 'id-evenement' },
          searchParams: { type: 'session' },
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
        {}
      )
    })
  })

  describe('Quand le conseiller est France Travail', () => {
    it('redirige vers le portefeuille', async () => {
      //Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: unUtilisateur({ structure: StructureConseiller.POLE_EMPLOI }),
      })

      // When
      const promise = EmargementRdv({
        params: { idEvenement: 'id-evenement' },
        searchParams: { type: 'ac' },
      })

      //Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT REDIRECT /mes-jeunes')
      )
      expect(redirect).toHaveBeenCalledWith('/mes-jeunes')
    })
  })
})
