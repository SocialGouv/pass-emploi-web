import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'

import AgendaPage from 'app/(connected)/(with-sidebar)/(with-chat)/agenda/AgendaPage'
import Agenda from 'app/(connected)/(with-sidebar)/(with-chat)/agenda/page'
import { unUtilisateur } from 'fixtures/auth'

jest.mock('app/(connected)/(with-sidebar)/(with-chat)/agenda/AgendaPage')

describe('AgendaPage server side', () => {
  describe('Pour un conseiller France Travail', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: unUtilisateur({ structure: 'POLE_EMPLOI' }),
      })

      // When
      const promise = Agenda({})

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('quand le conseiller est connecté', () => {
    it('récupère les infos de la page', async () => {
      // When
      render(await Agenda({ searchParams: { onglet: 'etablissement' } }))

      // Then
      expect(AgendaPage).toHaveBeenCalledWith(
        { onglet: 'ETABLISSEMENT', periodeIndexInitial: 0 },
        {}
      )
    })
  })
})
