import { render } from '@testing-library/react'
import { notFound, redirect } from 'next/navigation'

import CloturePage from 'app/(connected)/(with-sidebar)/(without-chat)/evenements/[idEvenement]/cloture/CloturePage'
import Cloture from 'app/(connected)/(with-sidebar)/(without-chat)/evenements/[idEvenement]/cloture/page'
import { unEvenement } from 'fixtures/evenement'
import { StructureConseiller } from 'interfaces/conseiller'
import { StatutAnimationCollective } from 'interfaces/evenement'
import { getDetailsEvenement } from 'services/evenements.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock('services/evenements.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/evenements/[idEvenement]/cloture/CloturePage'
)

describe('CloturePage server side', () => {
  describe("quand l'utilisateur est connecté", () => {
    beforeEach(() => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { id: 'id-conseiller', structure: 'MILO' },
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
          params: Promise.resolve({ idEvenement: 'id-animation-collective' }),
          searchParams: Promise.resolve({ redirectUrl: 'redirectUrl' }),
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
        undefined
      )
    })

    it("renvoie une 404 si l’animation collective n'existe pas", async () => {
      // Given
      ;(getDetailsEvenement as jest.Mock).mockResolvedValue(undefined)

      // When
      const promise = Cloture({
        params: Promise.resolve({ idEvenement: 'id-animation-collective' }),
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
        params: Promise.resolve({ idEvenement: 'id-animation-collective' }),
      })

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('quand l’utilisateur est France Travail', () => {
    it('renvoie sur la liste des jeunes', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: StructureConseiller.POLE_EMPLOI },
      })

      // When
      const promise = Cloture({
        params: Promise.resolve({ idEvenement: 'id-animation-collective' }),
      })

      // Then
      await expect(promise).rejects.toEqual(
        new Error('NEXT_REDIRECT /mes-jeunes')
      )
      expect(redirect).toHaveBeenCalledWith('/mes-jeunes')
    })
  })
})
