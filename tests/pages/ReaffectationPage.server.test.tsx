import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'

import Reaffectation from 'app/(connected)/(with-sidebar)/(with-chat)/reaffectation/page'
import ReaffectationPage from 'app/(connected)/(with-sidebar)/(with-chat)/reaffectation/ReaffectationPage'
import { unUtilisateur } from 'fixtures/auth'

jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/reaffectation/ReaffectationPage'
)

describe('Reaffectation', () => {
  describe("quand le conseiller n'est pas superviseur", () => {
    it('renvoie une page 404', async () => {
      // When
      const promise = Reaffectation()

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('quand le conseiller est superviseur', () => {
    it('prépare la page', async () => {
      // Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: unUtilisateur({ estSuperviseur: true }),
      })

      // When
      render(await Reaffectation())

      // Then
      expect(ReaffectationPage).toHaveBeenCalledWith(
        { estSuperviseurResponsable: false },
        {}
      )
    })
  })
})
