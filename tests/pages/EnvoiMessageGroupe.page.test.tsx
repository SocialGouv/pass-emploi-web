import { RenderResult, screen } from '@testing-library/react'
import { mockedJeunesService } from 'fixtures/services'
import EnvoiMessageGroupe from 'pages/mes-jeunes/envoi-message-groupe'
import { JeunesService } from 'services/jeunes.service'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'

describe("quand le formulaire n'a pas encore été soumis", () => {
  let jeunesService: JeunesService
  let page: RenderResult

  beforeEach(async () => {
    jeunesService = mockedJeunesService()
    page = renderWithSession(
      <DIProvider dependances={{ jeunesService }}>
        <EnvoiMessageGroupe jeunes={[]} withoutChat={true} />
      </DIProvider>
    )
  })

  it('devrait afficher les champ de création de compte', () => {
    // Then
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: "Message multi-destinataires",
      })
    ).toBeInTheDocument()

    expect(screen.getAllByRole('group').length).toBe(2)
    expect(screen.getByLabelText('* Message')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument()
  })
})
