import { fireEvent, screen } from '@testing-library/react'
import Home from 'pages/index'
import React from 'react'
import { uneListeDeRdv } from 'fixtures/rendez-vous'
import renderWithSession from '../renderWithSession'
import { DIProvider } from 'utils/injectionDependances'
import { MessagesService } from 'services/messages.service'

describe('Home', () => {
  const rendezVousPasses = uneListeDeRdv()
  const rendezVousFuturs = uneListeDeRdv()
  let messagesService: MessagesService

  beforeEach(() => {
    messagesService = {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getDb: jest.fn(),
      sendNouveauMessage: jest.fn(),
      setReadByConseiller: jest.fn(),
    }

    renderWithSession(
      <DIProvider dependances={{ messagesService }}>
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
