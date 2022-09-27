import { act, screen } from '@testing-library/react'
import { GetServerSidePropsResult } from 'next'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import renderWithContexts from '../renderWithContexts'

import { desRdvListItems, unRendezVous } from 'fixtures/rendez-vous'
import { mockedRendezVousService } from 'fixtures/services'
import { rdvToListItem } from 'interfaces/rdv'
import RendezVousPasses, {
  getServerSideProps,
} from 'pages/mes-jeunes/[jeune_id]/rendez-vous-passes'
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
            screen.getByText('Il n’y a pas de rendez-vous sur cette période.')
          ).toBeInTheDocument()
        })
      })
    })
  })

  describe('server side', () => {
    let rendezVousService: RendezVousService
    beforeEach(() => {
      rendezVousService = mockedRendezVousService({
        getRendezVousJeune: jest.fn(async () => [unRendezVous()]),
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
    describe('quand la session est valide', () => {
      let actual: GetServerSidePropsResult<any>

      it('récupère les rendez-vous passés d’un jeune avec son conseiller', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { id: 'id-conseiller', structure: 'MILO' },
          },
          validSession: true,
        })

        // When
        actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(rendezVousService.getRendezVousJeune).toHaveBeenCalledWith(
          'id-jeune',
          'PASSES',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { rdvs: [rdvToListItem(unRendezVous())] },
        })
      })
    })
    describe('quand le conseiller est Pôle emploi', () => {
      let actual: GetServerSidePropsResult<any>

      it('ne recupère pas les rendez-vous', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: { user: { structure: 'POLE_EMPLOI' } },
          validSession: true,
        })

        // When
        actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)
        // Then
        expect(rendezVousService.getRendezVousJeune).not.toHaveBeenCalled()
        expect(actual).toMatchObject({ props: { rdvs: [] } })
      })
    })
  })
})
