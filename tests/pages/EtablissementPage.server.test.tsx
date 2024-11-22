import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'

import EtablissementPage from 'app/(connected)/(with-sidebar)/(with-chat)/etablissement/EtablissementPage'
import Etablissement from 'app/(connected)/(with-sidebar)/(with-chat)/etablissement/page'
import { unUtilisateur } from 'fixtures/auth'

jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/etablissement/EtablissementPage'
)

describe('EtablissementPage server side', () => {
  describe('quand le conseiller est France Travail', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: unUtilisateur({ structure: 'POLE_EMPLOI' }),
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
      // When
      render(await Etablissement())

      // Then

      expect(EtablissementPage).toHaveBeenCalledWith({}, {})
    })

    it('prépare la page en tant que MILO', async () => {
      // When
      render(await Etablissement())

      // Then

      expect(EtablissementPage).toHaveBeenCalledWith({}, {})
    })
  })
})
