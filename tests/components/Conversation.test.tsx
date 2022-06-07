import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { Session } from 'next-auth'
import React from 'react'

import { FichiersService } from '../../services/fichiers.services'
import renderWithSession from '../renderWithSession'

import Conversation from 'components/Conversation'
import { desConseillersJeune, unJeuneChat } from 'fixtures/jeune'
import { desMessagesParJour } from 'fixtures/message'
import { mockedMessagesService } from 'fixtures/services'
import { UserStructure } from 'interfaces/conseiller'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { MessagesOfADay } from 'interfaces/message'
import { MessagesService } from 'services/messages.service'
import { formatDayDate } from 'utils/date'
import { DIProvider } from 'utils/injectionDependances'

describe('<Conversation />', () => {
  let jeuneChat: JeuneChat
  let onBack: () => void
  let messagesService: MessagesService
  let fichiersService: FichiersService
  let conseiller: Session.HydratedUser
  let conseillersJeunes: ConseillerHistorique[]
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
      ...fichiersService,
      postFichier: jest
        .fn()
        .mockReturnValue({ id: 'id-file', nom: 'imageupload.png' }),
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
      await renderWithSession(
        <DIProvider dependances={{ messagesService, fichiersService }}>
          <Conversation
            jeuneChat={jeuneChat}
            conseillers={conseillersJeunes}
            onBack={onBack}
          />
        </DIProvider>,
        { user: conseiller }
      )
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
      fireEvent.focus(messageInput)

      // Then
      expect(messagesService.setReadByConseiller).toHaveBeenCalledWith(
        jeuneChat.chatId
      )
    })

    it('envoie un nouveau message', async () => {
      // Given
      const newMessage = 'Ceci est un nouveau message du conseiller'
      const form = screen.getByTestId('newMessageForm')

      // When
      fireEvent.input(messageInput, { target: { value: newMessage } })
      fireEvent.submit(form)

      // Then
      await act(async () => {
        expect(messagesService.sendNouveauMessage).toHaveBeenCalledWith(
          {
            id: conseiller.id,
            structure: conseiller.structure,
          },
          jeuneChat,
          newMessage,
          'accessToken',
          'cleChiffrement'
        )
      })
    })
  })

  describe('quand on téléverse un fichier', () => {
    it('téléverse un fichier et affiche son nom en cas de succes', async () => {
      // Given
      const file: File = new File(['un contenu'], 'imageupload.png', {
        type: 'image/png',
      })
      const uploadFile = screen.getByTestId('newFile')
      const fileInput = within(uploadFile).getByLabelText(
        'Attacher une pièce jointe'
      )

      // When
      await waitFor(() =>
        fireEvent.change(fileInput, {
          target: { files: [file] },
        })
      )

      // Then
      await waitFor(() => {
        expect(fichiersService.postFichier).toHaveBeenCalledTimes(1)
        expect(screen.getByText('imageupload.png')).toBeInTheDocument()
        expect(uploadFile).toHaveAttribute('disabled', '')
      })
    })
  })
})
