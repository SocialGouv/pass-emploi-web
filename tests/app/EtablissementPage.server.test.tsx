import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'

import EtablissementPage from 'app/(connected)/(with-sidebar)/(with-chat)/etablissement/EtablissementPage'
import Etablissement from 'app/(connected)/(with-sidebar)/(with-chat)/etablissement/page'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/etablissement/EtablissementPage'
)

describe('EtablissementPage server side', () => {
  describe('quand le conseiller est France Travail', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: 'POLE_EMPLOI' },
      })

      // When
      const promise = Etablissement()

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('quand le conseiller est connecté', () => {
    it('prépare la page en tant que pass emploi', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: 'MILO' },
      })
      // When
      render(await Etablissement())

      // Then

      expect(EtablissementPage).toHaveBeenCalledWith({}, undefined)
    })

    it('prépare la page en tant que MILO', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: 'MILO' },
      })
      // When
      render(await Etablissement())

      // Then

      expect(EtablissementPage).toHaveBeenCalledWith({}, undefined)
    })
  })
})
