import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'

import Reaffectation from 'app/(connected)/(with-sidebar)/(with-chat)/reaffectation/page'
import ReaffectationPage from 'app/(connected)/(with-sidebar)/(with-chat)/reaffectation/ReaffectationPage'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/reaffectation/ReaffectationPage'
)

describe('Reaffectation', () => {
  describe("quand le conseiller n'est pas superviseur", () => {
    it('renvoie une page 404', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { estSuperviseur: false },
      })

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
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { estSuperviseur: true },
      })

      // When
      render(await Reaffectation())

      // Then
      expect(ReaffectationPage).toHaveBeenCalledWith({}, undefined)
    })
  })
})
