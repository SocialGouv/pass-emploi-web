import { fireEvent, RenderResult, screen } from '@testing-library/react'
import { mockedJeunesService } from 'fixtures/services'
import EnvoiMessageGroupe from 'pages/mes-jeunes/envoi-message-groupe'
import { JeunesService } from 'services/jeunes.service'
import { DIProvider } from 'utils/injectionDependances'
import renderWithSession from '../renderWithSession'
import { MessagesService } from 'services/messages.service'
import { unJeune, unJeuneChat } from 'fixtures/jeune'
import { UserStructure } from 'interfaces/conseiller'
import { Session } from 'next-auth'
import { Jeune } from 'interfaces/jeune'

describe("quand le formulaire n'a pas encore été soumis", () => {
  let destinataires: Jeune[]
  let conseiller: Session.User
  let jeunesService: JeunesService
  let messagesService: MessagesService
  let page: RenderResult
  let inputSearchJeune: HTMLInputElement
  let inputMessage: HTMLInputElement
  let submitButton: HTMLButtonElement
  let accessToken: string

  beforeEach(async () => {
    jeunesService = mockedJeunesService()
    jeunesChat = [unJeuneChat()]
    destinataires = [unJeune()]

    jeunesService = {
      getJeunesDuConseiller: jest.fn(),
      getJeuneDetails: jest.fn(),
      createCompteJeunePoleEmploi: jest.fn(),
      getJeunesDuConseillerParEmail: jest.fn(),
      reaffecter: jest.fn(),
    }

    messagesService = {
      observeJeuneChat: jest.fn(),
      observeJeuneReadingDate: jest.fn(),
      observeMessages: jest.fn(),
      sendNouveauMessage: jest.fn(),
      setReadByConseiller: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      countMessagesNotRead: jest.fn(),
      sendNouveauMessageMultiple: jest.fn(),
    }
    conseiller = {
      id: 'idConseiller',
      name: 'Taverner',
      structure: UserStructure.POLE_EMPLOI,
      estSuperviseur: false,
    }
    accessToken = 'accessToken'

    page = renderWithSession(
      <DIProvider dependances={{ jeunesService, messagesService }}>
        <EnvoiMessageGroupe jeunes={destinataires} withoutChat={true} />
      </DIProvider>
    )

    inputSearchJeune = screen.getByLabelText(
      '* Rechercher et ajouter des jeunes'
    )
    inputMessage = screen.getByLabelText('* Message')
    submitButton = screen.getByRole('button', {
      name: 'Envoyer',
    })
  })

  it('devrait afficher les champ de création de compte', () => {
    // Then
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Message multi-destinataires',
      })
    ).toBeInTheDocument()

    expect(screen.getAllByRole('group').length).toBe(2)
    expect(screen.getByLabelText('* Message')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument()
  })

  it('devrait afficher un bouton grisé si un des champs du formulaire est vide', () => {
    // Given
    // fireEvent.change(inputSearchJeune, { target: { value: '' } })
    fireEvent.change(inputMessage, { target: { value: 'Un message' } })

    // Then
    expect(submitButton).toHaveAttribute('disabled')
  })

  describe('quand on soumet le formulaire', () => {
    it('envoi un message à plusieurs destinataires', () => {
      // Given
      const newMessage = 'Un nouveau message pour plusieurs destinataires'

      // When
      fireEvent.change(inputSearchJeune, { target: { value: 'Kenji Girac' } })
      fireEvent.change(inputMessage, { target: { value: 'Un message' } })
      fireEvent.submit(submitButton)

      // Then
      expect(messagesService.sendNouveauMessageMultiple).toHaveBeenCalledWith(
        { id: conseiller.id, structure: conseiller.structure },
        destinataires,
        newMessage,
        accessToken
      )
    })
  })
})
