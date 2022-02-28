import { RenderResult, screen } from '@testing-library/react'

import MultidestinatairePage from 'pages/mes-jeunes/envoi-message-groupe'
import { JeunesService } from 'services/jeunes.service'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'

describe("quand le formulaire n'a pas encore été soumis", () => {
  let jeunesService: JeunesService
  let page: RenderResult

  beforeEach(async () => {
    jeunesService = {
      getJeunesDuConseiller: jest.fn(),
      getJeuneDetails: jest.fn(),
      createCompteJeunePoleEmploi: jest.fn(),
      getJeunesDuConseillerParEmail: jest.fn(),
      reaffecter: jest.fn(),
    }

    page = renderWithSession(
      <DIProvider dependances={{ jeunesService }}>
        <MultidestinatairePage jeunes={[]} />
      </DIProvider>
    )
  })

  it('devrait afficher les champ de création de compte', () => {
    // Then
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Envoi d’un message à plusieurs jeunes',
      })
    ).toBeInTheDocument()

    expect(screen.getByRole('form')).toBeInTheDocument()
    expect(screen.getAllByRole('group').length).toBe(2)
    expect(screen.getByLabelText('* Message')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument()
  })
})
