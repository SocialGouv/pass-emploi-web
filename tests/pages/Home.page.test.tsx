import { fireEvent, screen } from '@testing-library/react'
import { uneListeDeRdv } from 'fixtures/rendez-vous'
import Home from 'pages/index'
import React from 'react'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'

describe('Home', () => {
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

  beforeEach(() => {
    renderWithSession(
      <DIProvider dependances={{ jeunesService, rendezVousService }}>
        <Home
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
