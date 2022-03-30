import { fireEvent, screen } from '@testing-library/react'
import { uneListeDeRdv } from 'fixtures/rendez-vous'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import MesRendezvous, { getServerSideProps } from 'pages/mes-rendezvous'
import React from 'react'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import renderWithSession from '../renderWithSession'

jest.mock('next/router', () => ({ useRouter: jest.fn() }))
jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('MesRendezvous', () => {
  afterAll(() => jest.clearAllMocks())

  describe('client side', () => {
    const rendezVousPasses = uneListeDeRdv()
    const rendezVousFuturs = uneListeDeRdv()
    describe('contenu', () => {
      beforeEach(() => {
        renderWithSession(
          <MesRendezvous
            rendezVousFuturs={rendezVousFuturs}
            rendezVousPasses={rendezVousPasses}
          />
        )
      })

      it('a un titre de niveau 1', () => {
        const heading = screen.getByRole('heading', {
          level: 1,
          name: 'Rendez-vous',
        })

        expect(heading).toBeInTheDocument()
      })

      it('a un lien pour fixer un rendez-vous', () => {
        const addRdv = screen.getByRole('link', {
          name: 'Fixer un rendez-vous',
        })

        expect(addRdv).toBeInTheDocument()
        expect(addRdv).toHaveAttribute('href', '/mes-jeunes/edition-rdv')
      })

      it('a deux boutons', () => {
        const rdvsButton = screen.getByRole('tab', {
          name: 'Prochains rendez-vous',
        })

        const oldRdvsButton = screen.getByRole('tab', {
          name: 'Rendez-vous passés',
        })

        expect(rdvsButton).toBeInTheDocument()
        expect(oldRdvsButton).toBeInTheDocument()
      })

      it('affiche les anciens rdvs quand on clique sur le bouton rendez-vous passés', async () => {
        const oldRdvsButton = screen.getByRole('tab', {
          name: 'Rendez-vous passés',
        })

        await fireEvent.click(oldRdvsButton)

        const table = screen.getByRole('table')

        const rows = screen.getAllByRole('row')

        expect(table).toBeInTheDocument()
        expect(rows.length - 1).toBe(rendezVousPasses.length)
      })
    })

    describe('quand la création de rdv est réussie', () => {
      let replace: jest.Mock
      beforeEach(() => {
        // Given
        replace = jest.fn(() => Promise.resolve())
        ;(useRouter as jest.Mock).mockReturnValue({ replace })

        // When
        renderWithSession(
          <MesRendezvous
            rendezVousFuturs={rendezVousFuturs}
            rendezVousPasses={rendezVousPasses}
            creationSuccess={true}
          />
        )
      })

      it('affiche un message de succès', () => {
        // Then
        expect(
          screen.getByText('Le rendez-vous a bien été créé')
        ).toBeInTheDocument()
      })

      it('permet de cacher le message de succès', () => {
        // Given
        const fermerMessage = screen.getByRole('button', {
          name: "J'ai compris",
        })

        // When
        fermerMessage.click()

        // Then
        expect(() =>
          screen.getByText('Le rendez-vous a bien été créé')
        ).toThrow()
        expect(replace).toHaveBeenCalledWith('', undefined, { shallow: true })
      })
    })
  })

  describe('server side', () => {
    describe('Pour un conseiller Pole Emploi', () => {
      it('renvoie une 404', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          session: {
            user: { structure: 'POLE_EMPLOI' },
          },
          hasSession: true,
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
        expect(actual).toEqual({ notFound: true })
      })
    })
  })
})
