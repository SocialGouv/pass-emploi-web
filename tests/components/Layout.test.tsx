import { act, waitFor } from '@testing-library/react'

import renderWithSession from '../renderWithSession'

import AppHead from 'components/AppHead'
import ChatRoom from 'components/layouts/ChatRoom'
import Layout from 'components/layouts/Layout'
import { desJeunes, unJeuneChat } from 'fixtures/jeune'
import { mockedJeunesService, mockedMessagesService } from 'fixtures/services'
import { Jeune, JeuneChat } from 'interfaces/jeune'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { DIProvider } from 'utils/injectionDependances'

jest.mock('components/layouts/Sidebar', () => jest.fn(() => <></>))
jest.mock('components/layouts/ChatRoom', () => jest.fn(() => <></>))
jest.mock('components/AppHead', () => jest.fn(() => <></>))
jest.useFakeTimers()

const mockAudio = jest.fn()
global.Audio = jest.fn().mockImplementation(() => ({
  play: mockAudio,
}))

describe('<Layout />', () => {
  let updateChatRef: (jeuneChat: JeuneChat) => void
  const jeunes: Jeune[] = desJeunes()
  let jeunesChats: JeuneChat[]
  let jeunesService: JeunesService
  let messagesService: MessagesService
  beforeEach(async () => {
    jest.setSystemTime(new Date())

    jeunesChats = [
      unJeuneChat({
        ...jeunes[0],
        chatId: `chat-${jeunes[0].id}`,
        seenByConseiller: true,
      }),
      unJeuneChat({
        ...jeunes[1],
        chatId: `chat-${jeunes[1].id}`,
        seenByConseiller: true,
      }),
      unJeuneChat({
        ...jeunes[2],
        chatId: `chat-${jeunes[2].id}`,
        seenByConseiller: false,
      }),
    ]

    jeunesService = mockedJeunesService()
    messagesService = mockedMessagesService({
      signIn: jest.fn(() => Promise.resolve()),
      observeJeuneChat: jest.fn((_, jeune, _cle, fn) => {
        updateChatRef = fn
        updateChatRef(
          jeunesChats.find((jeuneChat) => jeuneChat.id === jeune.id)!
        )
        return () => {}
      }),
    })
  })

  describe('quand le conseiller a des jeunes', () => {
    beforeEach(async () => {
      ;(jeunesService.getJeunesDuConseiller as jest.Mock).mockResolvedValue(
        jeunes
      )

      await act(async () => {
        await renderWithSession(
          <DIProvider dependances={{ jeunesService, messagesService }}>
            <Layout>
              <FakeComponent pageTitle='un titre' />
            </Layout>
          </DIProvider>
        )
      })
    })

    it('fetch conseiller list of jeune', async () => {
      // Then
      expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
        '1',
        'accessToken'
      )
    })

    it('sign into chat', async () => {
      // Then
      expect(messagesService.signIn).toHaveBeenCalled()
    })

    describe('pour chaque jeune', () => {
      const cases = jeunes.map((jeune) => [jeune])

      it.each(cases)('subscribes to chat', async (jeune) => {
        // Then
        expect(messagesService.observeJeuneChat).toHaveBeenCalledWith(
          '1',
          jeune,
          'cleChiffrement',
          expect.any(Function)
        )
      })
    })

    describe('mise à jour des chats', () => {
      it("notifie quand c'est un nouveau message d'un jeune", async () => {
        // Given
        const unJeuneChatNonLu = unJeuneChat({
          ...jeunes[0],
          lastMessageSentBy: 'jeune',
          chatId: `chat-${jeunes[0].id}`,
          lastMessageContent:
            'Ceci est tellement nouveau, donne moi de la notif',
        })

        // When
        await act(async () => {
          updateChatRef(unJeuneChatNonLu)
        })

        // Then
        await waitFor(() => {
          expect(mockAudio).toHaveBeenCalled()
        })
      })
      it("ne notifie pas quand c'est une tierce modification du chat", async () => {
        // Given
        const unJeuneChatDejaLu = unJeuneChat({
          ...jeunes[0],
          chatId: `chat-${jeunes[0].id}`,
          lastMessageSentBy: 'conseiller',
        })

        // When
        await act(async () => {
          updateChatRef(unJeuneChatDejaLu)
        })

        // Then
        await waitFor(() => {
          expect(mockAudio).not.toHaveBeenCalled()
        })
      })
    })

    it('paramètre la balise head en fonction des messages non lus', async () => {
      // Then
      await waitFor(() => {
        expect(AppHead).toHaveBeenCalledWith(
          {
            hasMessageNonLu: true,
            titre: 'un titre',
          },
          {}
        )
      })
    })

    it('affiche la ChatRoom avec les jeunes avec un message non lu en premier', async () => {
      // Then
      await waitFor(() => {
        expect(ChatRoom).toHaveBeenCalledWith(
          { jeunesChats: [jeunesChats[2], jeunesChats[0], jeunesChats[1]] },
          {}
        )
      })
    })
  })

  function FakeComponent(_: { pageTitle: string }) {
    return <></>
  }
})
