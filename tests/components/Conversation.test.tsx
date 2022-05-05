import { act, fireEvent, screen, within } from '@testing-library/react'
import { Session } from 'next-auth'
import React from 'react'

import renderWithSession from '../renderWithSession'

import Conversation from 'components/layouts/Conversation'
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

    conseiller = {
      id: 'idConseiller',
      name: 'Taverner',
      structure: UserStructure.POLE_EMPLOI,
      estSuperviseur: false,
      email: 'mail@mail.com',
      estConseiller: true,
    }

    // https://github.com/jsdom/jsdom/issues/1695
    window.HTMLElement.prototype.scrollIntoView = jest.fn()
    await act(async () => {
      await renderWithSession(
        <DIProvider dependances={{ messagesService }}>
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

  it('subscribes to chat messages', async () => {
    // Then
    expect(messagesService.observeMessages).toHaveBeenCalledWith(
      jeuneChat.chatId,
      'cleChiffrement',
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

    it.each(casesMessages)(`displays conseiller full name`, (message) => {
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
          'accessToken',
          'cleChiffrement'
        )
      })
    })
  })
})
