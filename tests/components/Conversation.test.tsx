import { act, fireEvent, screen } from '@testing-library/react'
import Conversation from 'components/layouts/Conversation'
import { unJeuneChat } from 'fixtures/jeune'
import { desMessagesParJour } from 'fixtures/message'
import { MessagesOfADay } from 'interfaces'
import { JeuneChat } from 'interfaces/jeune'
import { Session } from 'next-auth'
import React from 'react'
import { MessagesService } from 'services/messages.service'
import { DIProvider } from 'utils/injectionDependances'
import { UserStructure } from 'interfaces/conseiller'
import { formatDayDate } from 'utils/date'
import renderWithSession from '../renderWithSession'
import { mockedMessagesService } from 'fixtures/services'

describe('<Conversation />', () => {
  let jeuneChat: JeuneChat
  let onBack: () => void
  let messagesService: MessagesService
  let conseiller: Session.User
  let accessToken: string
  let tokenChat: string
  const messagesParJour = desMessagesParJour()
  beforeEach(async () => {
    jeuneChat = unJeuneChat()
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
        (idChat: string, fn: (messages: MessagesOfADay[]) => void) => {
          fn(messagesParJour)
          return () => {}
        }
      ),
      sendNouveauMessage: jest.fn(() => {
        return Promise.resolve()
      }),
    })

    conseiller = {
      id: 'idConseiller',
      name: 'Taverner',
      structure: UserStructure.POLE_EMPLOI,
      estSuperviseur: false,
    }
    accessToken = 'accessToken'
    tokenChat = 'tokenChat'

    await act(async () => {
      await renderWithSession(
        <DIProvider dependances={{ messagesService }}>
          <Conversation jeuneChat={jeuneChat} onBack={onBack} />
        </DIProvider>,
        { user: conseiller, firebaseToken: tokenChat }
      )
    })
    // https://github.com/jsdom/jsdom/issues/1695
    window.HTMLElement.prototype.scrollIntoView = jest.fn()
  })

  it('subscribes to chat messages', async () => {
    // Then
    expect(messagesService.observeMessages).toHaveBeenCalledWith(
      jeuneChat.chatId,
      expect.any(Function)
    )
  })

  it('marks the conversation as read', async () => {
    // Then
    expect(messagesService.setReadByConseiller).toHaveBeenCalledWith(
      jeuneChat.chatId
    )
  })

  it('subscribes to jeune reading', async () => {
    // Then
    expect(messagesService.observeJeuneReadingDate).toHaveBeenCalledWith(
      jeuneChat.chatId,
      expect.any(Function)
    )
  })

  const cases = messagesParJour.map((messagesDUnJour) => [messagesDUnJour])
  describe.each(cases)('For each day with messages', (messagesDUnJour) => {
    it(`displays the date (${formatDayDate(messagesDUnJour.date)})`, () => {
      // Then
      expect(
        screen.getByText(`Le ${formatDayDate(messagesDUnJour.date)}`)
      ).toBeInTheDocument()
    })

    const casesMessages = messagesDUnJour.messages.map((message) => [message])
    it.each(casesMessages)(`displays message content`, (message) => {
      // Then
      expect(screen.getByText(message.content)).toBeInTheDocument()
    })
  })

  describe('when sending message', () => {
    let messageInput: HTMLInputElement
    beforeEach(() => {
      messageInput = screen.getByPlaceholderText('Écrivez votre message ici...')
    })

    it('marks the conversation as read', async () => {
      // When
      fireEvent.focus(messageInput)

      // Then
      expect(messagesService.setReadByConseiller).toHaveBeenCalledWith(
        jeuneChat.chatId
      )
    })

    it('sends new message', async () => {
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
          accessToken
        )
      })
    })
  })
})
