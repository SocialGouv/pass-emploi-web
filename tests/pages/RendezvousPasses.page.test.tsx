import { act, screen } from '@testing-library/react'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import renderWithContexts from '../renderWithContexts'

import { desRdvListItems, uneListeDeRdv } from 'fixtures/rendez-vous'
import { mockedRendezVousService } from 'fixtures/services'
import { getServerSideProps } from 'pages/mes-jeunes/[jeune_id]/historique'
import RendezVousPasses from 'pages/mes-jeunes/[jeune_id]/rendez-vous-passes'
import { RendezVousService } from 'services/rendez-vous.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('RendezVousPasses', () => {
  describe('client side', () => {
    describe('quand l’utilisateur n’est pas Pôle emploi ', () => {
      describe('quand il y a des rendez-vous passés', () => {
        it('affiche le tableau des rendez-vous passés du conseiller avec le jeune', async () => {
          // Given
          const rdvs = desRdvListItems()

          // When
          await act(async () => {
            await renderWithContexts(<RendezVousPasses rdvs={rdvs} />)
          })

          // Then
          rdvs.forEach((rdv) => {
            expect(screen.getByText(rdv.type)).toBeInTheDocument()
            expect(screen.getByText(rdv.modality)).toBeInTheDocument()
          })
        })
      })

      describe('quand il n’y a pas de rendez-vous passés', () => {
        it('affiche un message', async () => {
          // When
          await act(async () => {
            await renderWithContexts(<RendezVousPasses rdvs={[]} />, {})
          })

          // Then
          expect(
            screen.getByText('Il n’y a pas de rendez-vous sur cette période')
          )
        })
      })
    })
  })

  describe('server side', () => {
    let rendezVousService: RendezVousService
    beforeEach(() => {
      rendezVousService = mockedRendezVousService({
        getRendezVousJeune: jest.fn(async () => uneListeDeRdv()),
      })
      ;(withDependance as jest.Mock).mockImplementation((dependance) => {
        if (dependance === 'rendezVousService') return rendezVousService
      })
    })

    describe('quand la session est invalide', () => {
      it('redirige', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          redirect: 'whatever',
          validSession: false,
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({ redirect: 'whatever' })
      })
    })
  })
})
