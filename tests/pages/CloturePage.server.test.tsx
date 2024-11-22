import { render } from '@testing-library/react'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import CloturePage from 'app/(connected)/(with-sidebar)/(without-chat)/evenements/[id_evenement]/cloture/CloturePage'
import Cloture from 'app/(connected)/(with-sidebar)/(without-chat)/evenements/[id_evenement]/cloture/page'
import { unUtilisateur } from 'fixtures/auth'
import { unEvenement } from 'fixtures/evenement'
import { StructureConseiller } from 'interfaces/conseiller'
import { StatutAnimationCollective } from 'interfaces/evenement'
import { getDetailsEvenement } from 'services/evenements.service'

jest.mock('services/evenements.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/evenements/[id_evenement]/cloture/CloturePage'
)

describe('CloturePage server side', () => {
  describe("quand l'utilisateur est connecté", () => {
    beforeEach(() => {
      // Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { estConseiller: true, id: 'id-conseiller', structure: 'MILO' },
        accessToken: 'accessToken',
      })
      ;(getDetailsEvenement as jest.Mock).mockResolvedValue(
        unEvenement({ statut: StatutAnimationCollective.AClore })
      )
    })

    it('récupère l’animation collective concernée', async () => {
      // When
      render(
        await Cloture({
          params: { id_evenement: 'id-animation-collective' },
          searchParams: { redirectUrl: 'redirectUrl' },
        })
      )

      // Then
      expect(getDetailsEvenement).toHaveBeenCalledWith(
        'id-animation-collective',
        'accessToken'
      )
      expect(CloturePage).toHaveBeenCalledWith(
        {
          evenement: unEvenement({
            statut: StatutAnimationCollective.AClore,
          }),
          returnTo: '/mes-jeunes/edition-rdv?idRdv=1&redirectUrl=redirectUrl',
        },
        {}
      )
    })

    it("renvoie une 404 si l’animation collective n'existe pas", async () => {
      // Given
      ;(getDetailsEvenement as jest.Mock).mockResolvedValue(undefined)

      // When
      const promise = Cloture({
        params: { id_evenement: 'id-animation-collective' },
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })

    it("renvoie une 404 si l’animation collective n'est pas à clore", async () => {
      // Given
      ;(getDetailsEvenement as jest.Mock).mockResolvedValue(
        unEvenement({ statut: StatutAnimationCollective.AVenir })
      )

      // When
      const promise = Cloture({
        params: { id_evenement: 'id-animation-collective' },
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('quand l’utilisateur est France Travail', () => {
    it('renvoie sur la liste des jeunes', async () => {
      // Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: unUtilisateur({ structure: StructureConseiller.POLE_EMPLOI }),
      })

      // When
      const promise = Cloture({
        params: { id_evenement: 'id-animation-collective' },
      })

      // Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT REDIRECT /mes-jeunes')
      )
      expect(redirect).toHaveBeenCalledWith('/mes-jeunes')
    })
  })
})
