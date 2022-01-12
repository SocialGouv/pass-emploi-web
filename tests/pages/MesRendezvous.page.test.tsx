import { fireEvent, screen } from '@testing-library/react'
import { uneListeDeRdv } from 'fixtures/rendez-vous'
import { GetServerSidePropsContext } from 'next/types'
import MesRendezvous, { getServerSideProps } from 'pages/mes-rendezvous'
import React from 'react'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import { DIProvider } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import renderWithSession from '../renderWithSession'

jest.mock('utils/withMandatorySessionOrRedirect')

afterAll(() => jest.clearAllMocks())

describe('MesRendezvous', () => {
  const rendezVousPasses = uneListeDeRdv()
  const rendezVousFuturs = uneListeDeRdv()
  const jeunesService: JeunesService = {
    createCompteJeunePoleEmploi: jest.fn(),
    getJeuneDetails: jest.fn(),
    getJeunesDuConseiller: jest.fn(),
  }
  const rendezVousService: RendezVousService = {
    deleteRendezVous: jest.fn(),
    getRendezVousConseiller: jest.fn(),
    getRendezVousJeune: jest.fn(),
    postNewRendezVous: jest.fn(),
  }

  describe('Pour un conseiller MiLo', () => {
    beforeEach(() => {
      renderWithSession(
        <DIProvider dependances={{ jeunesService, rendezVousService }}>
          <MesRendezvous
            rendezVousFuturs={rendezVousFuturs}
            rendezVousPasses={rendezVousPasses}
          />
        </DIProvider>
      )
    })

    it('devrait avoir un titre de niveau 1', () => {
      const heading = screen.getByRole('heading', {
        level: 1,
        name: 'Rendez-vous',
      })

      expect(heading).toBeInTheDocument()
    })

    it('devrait avoir un bouton fixer un rendez-vous', () => {
      const button = screen.getByRole('button', {
        name: 'Fixer un rendez-vous',
      })

      expect(button).toBeInTheDocument()
    })

    it('devrait avoir deux boutons', () => {
      const rdvsButton = screen.getByRole('tab', {
        name: 'Prochains rendez-vous',
      })

      const oldRdvsButton = screen.getByRole('tab', {
        name: 'Rendez-vous passés',
      })

      expect(rdvsButton).toBeInTheDocument()
      expect(oldRdvsButton).toBeInTheDocument()
    })

    it('devrait afficher les anciens rdvs quand on clique sur le bouton rendez-vous passés', async () => {
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
