import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'

import AgendaPage from 'app/(connected)/(with-sidebar)/(with-chat)/agenda/AgendaPage'
import Agenda from 'app/(connected)/(with-sidebar)/(with-chat)/agenda/page'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock('app/(connected)/(with-sidebar)/(with-chat)/agenda/AgendaPage')

describe('AgendaPage server side', () => {
  describe('Pour un conseiller France Travail', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: 'POLE_EMPLOI' },
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
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: 'MILO' },
      })

      // When
      render(
        await Agenda({
          searchParams: Promise.resolve({ onglet: 'mission-locale' }),
        })
      )

      // Then
      expect(AgendaPage).toHaveBeenCalledWith(
        { onglet: 'MISSION_LOCALE', debutPeriodeInitiale: undefined },
        undefined
      )
    })

    it('parse la date de début demandée', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: 'MILO' },
      })

      // When
      render(
        await Agenda({
          searchParams: Promise.resolve({
            onglet: 'mission-locale',
            debut: '2023-04-12',
          }),
        })
      )

      // Then
      expect(AgendaPage).toHaveBeenCalledWith(
        { onglet: 'MISSION_LOCALE', debutPeriodeInitiale: '2023-04-12' },
        undefined
      )
    })

    it('vérifie la validité de la date de début demandée', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: 'MILO' },
      })

      // When
      render(
        await Agenda({
          searchParams: Promise.resolve({
            onglet: 'mission-locale',
            debut: 'cestpasunedate',
          }),
        })
      )

      // Then
      expect(AgendaPage).toHaveBeenCalledWith(
        { onglet: 'MISSION_LOCALE', debutPeriodeInitiale: undefined },
        undefined
      )
    })
  })
})
