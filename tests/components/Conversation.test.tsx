import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Session } from 'next-auth'
import React from 'react'

import Conversation from 'components/chat/Conversation'
import { desConseillersJeune, unJeuneChat } from 'fixtures/jeune'
import { desMessagesParJour } from 'fixtures/message'
import { mockedMessagesService } from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { MessagesOfADay } from 'interfaces/message'
import { FichiersService } from 'services/fichiers.service'
import { MessagesService } from 'services/messages.service'
import renderWithSession from 'tests/renderWithSession'
import { formatDayDate } from 'utils/date'
import { DIProvider } from 'utils/injectionDependances'

describe('<Conversation />', () => {
  let jeuneChat: JeuneChat
  let onBack: () => void
  let messagesService: MessagesService
  let fichiersService: FichiersService
  let conseiller: Session.HydratedUser
  let conseillersJeunes: ConseillerHistorique[]
  let rerender: (children: JSX.Element) => void
  const messagesParJour = desMessagesParJour()
  beforeEach(async () => {
    jeuneChat = unJeuneChat()
    conseillersJeunes = desConseillersJeune()
    onBack = jest.fn()
    messagesService = mockedMessagesService({
      observeJeuneChat: jest.fn(),
      observeJeuneReadingDate: jest.fn(
        (idChat: string, fn: (date: Date) => void) => {
          fn(new Date())
          return () => {}
        }
      ),
      observeMessages: jest.fn(
        (_idChat, _cle, fn: (messages: MessagesOfADay[]) => void) => {
          fn(messagesParJour)
          return () => {}
        }
      ),
      sendNouveauMessage: jest.fn(() => {
        return Promise.resolve()
      }),
    })
    fichiersService = {
      uploadFichier: jest
        .fn()
        .mockResolvedValue({ id: 'id-fichier', nom: 'imageupload.png' }),
      deleteFichier: jest.fn().mockResolvedValue(undefined),
    }

    conseiller = {
      id: 'idConseiller',
      name: 'Taverner',
      structure: UserStructure.POLE_EMPLOI,
      estSuperviseur: false,
      email: 'mail@mail.com',
      estConseiller: true,
    }

    await act(async () => {
      const renderResult = await renderWithSession(
        <DIProvider dependances={{ messagesService, fichiersService }}>
          <Conversation
            jeuneChat={jeuneChat}
            conseillers={conseillersJeunes}
            onBack={onBack}
          />
        </DIProvider>,
        { user: conseiller }
      )
      rerender = renderResult.rerender
    })
  })

  it('s’abonne au message de la conversation', async () => {
    // Then
    expect(messagesService.observeMessages).toHaveBeenCalledWith(
      jeuneChat.chatId,
      'cleChiffrement',
      expect.any(Function)
    )
  })

  it('marque la conversation en "lu"', async () => {
    // Then
    expect(messagesService.setReadByConseiller).toHaveBeenCalledWith(
      jeuneChat.chatId
    )
  })

  it('s’abonne à "jeuneReading"', async () => {
    // Then
    expect(messagesService.observeJeuneReadingDate).toHaveBeenCalledWith(
      jeuneChat.chatId,
      expect.any(Function)
    )
  })

  it('supprime les inputs qui ont commencé a étre saisis (fichier et texte) quand il est rechanger', async () => {
    // Given
    const file = new File(['un contenu'], 'imageupload.png', {
      type: 'image/png',
    })
    const fileInput = screen.getByLabelText('Attacher une pièce jointe')
    const messageInput = screen.getByPlaceholderText(
      'Écrivez votre message ici...'
    )
    await userEvent.upload(fileInput, file, { applyAccept: false })
    await userEvent.type(messageInput, 'TOTO')

    const newJeuneChat = unJeuneChat({ chatId: 'new-jeune-chat' })
    rerender(
      <DIProvider dependances={{ messagesService, fichiersService }}>
        <Conversation
          jeuneChat={newJeuneChat}
          conseillers={conseillersJeunes}
          onBack={onBack}
        />
      </DIProvider>
    )
    // Then
    expect(() => screen.getByText('imageupload.png')).toThrow()
    expect(screen.getByLabelText('Message à envoyer')).toHaveValue('')
    expect(
      screen.getByRole('button', { name: 'Envoyer le message' })
    ).toHaveAttribute('disabled')
  })

  const cases = messagesParJour.map((messagesDUnJour) => [messagesDUnJour])
  describe.each(cases)('Pour chaque jour avec message', (messagesDUnJour) => {
    it(`affiche la date (${formatDayDate(messagesDUnJour.date)})`, () => {
      // Then
      expect(
        screen.getByText(`Le ${formatDayDate(messagesDUnJour.date)}`)
      ).toBeInTheDocument()
    })

    const casesMessages = messagesDUnJour.messages.map((message) => [message])
    it.each(casesMessages)(`affiche le contenu du message`, (message) => {
      // Then
      expect(screen.getByText(message.content)).toBeInTheDocument()
    })

    it.each(casesMessages)(
      `affiche le nom complet du conseiller`,
      (message) => {
        // Then
        const messageItem = screen.getByTestId(message.id)
        const conseiller = conseillersJeunes.find(
          (conseiller) => conseiller.id === message.conseillerId
        )
        expect(
          within(messageItem).getByText(
            `${conseiller?.prenom} ${conseiller?.nom}`,
            { exact: false }
          )
        ).toBeInTheDocument()
      }
    )
  })

  describe('quand on envoie un message', () => {
    let messageInput: HTMLInputElement
    beforeEach(() => {
      messageInput = screen.getByPlaceholderText('Écrivez votre message ici...')
    })

    it('marque la conversation en "lu"', async () => {
      // When
      await act(() => {
        messageInput.focus()
      })

      // Then
      expect(messagesService.setReadByConseiller).toHaveBeenCalledWith(
        jeuneChat.chatId
      )
    })

    it('envoie un nouveau message', async () => {
      // Given
      const newMessage = 'Ceci est un nouveau message du conseiller'
      const submitButton = screen.getByRole('button', { name: /Envoyer/ })

      // When
      await userEvent.type(messageInput, newMessage)
      await userEvent.click(submitButton)

      // Then
      expect(messagesService.sendNouveauMessage).toHaveBeenCalledWith({
        conseiller: {
          id: conseiller.id,
          structure: conseiller.structure,
        },
        jeuneChat: jeuneChat,
        newMessage: newMessage,
        accessToken: 'accessToken',
        cleChiffrement: 'cleChiffrement',
      })
    })
  })

  describe('quand on crée un message avec une pièce jointe', () => {
    let uploadFileButton: HTMLButtonElement
    let file: File
    let submitButton: HTMLButtonElement
    beforeEach(async () => {
      // Given
      file = new File(['un contenu'], 'imageupload.png')

      const fileInput = screen.getByLabelText('Attacher une pièce jointe')
      uploadFileButton = fileInput.closest('button')!
      submitButton = screen.getByRole('button', { name: /Envoyer/ })

      // When
      await userEvent.upload(fileInput, file, { applyAccept: false })
    })

    it('téléverse un fichier et affiche son nom en cas de succès', async () => {
      // Given
      // Then
      expect(screen.getByText('imageupload.png')).toBeInTheDocument()
      expect(
        screen.getByLabelText('Supprimer la pièce jointe')
      ).toBeInTheDocument()
      expect(uploadFileButton).toHaveAttribute('disabled', '')
      expect(fichiersService.uploadFichier).toHaveBeenCalledWith(
        ['jeune-1'],
        file,
        'accessToken'
      )
    })

    it('on peut supprimer la pièce jointe ', async () => {
      // Given
      const boutonDeleteFichier = screen.getByLabelText(
        'Supprimer la pièce jointe'
      )
      // When
      await userEvent.click(boutonDeleteFichier)
      // Then
      expect(fichiersService.deleteFichier).toHaveBeenCalledWith(
        'id-fichier',
        'accessToken'
      )
      expect(() => screen.getByText('imageupload.png')).toThrow()
    })

    it('création d’un message avec une pièce jointe', async () => {
      await userEvent.click(submitButton)

      // Then
      expect(messagesService.sendNouveauMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          infoPieceJointe: { id: 'id-fichier', nom: 'imageupload.png' },
        })
      )
    })
  })

  describe("quand on reçoit un message de partage d'offre", () => {
    it("affiche le titre de l'offre", async () => {
      // Then
      expect(screen.getByText('Une offre')).toBeInTheDocument()
    })
    it("affiche le lien de l'offre", async () => {
      // Then
      expect(
        screen.getByRole('link', { name: 'Voir l’offre (nouvelle fenêtre)' })
      ).toBeInTheDocument()
    })
  })
})
