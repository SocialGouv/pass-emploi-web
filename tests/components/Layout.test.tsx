import { act, screen } from '@testing-library/react'
import { useRouter } from 'next/router'

import AppHead from 'components/AppHead'
import ChatRoom from 'components/chat/ChatRoom'
import AlertDisplayer from 'components/layouts/AlertDisplayer'
import Layout from 'components/layouts/Layout'
import { unConseiller } from 'fixtures/conseiller'
import { desItemsJeunes, unJeuneChat } from 'fixtures/jeune'
import {
  mockedConseillerService,
  mockedJeunesService,
  mockedMessagesService,
} from 'fixtures/services'
import { JeuneChat, JeuneFromListe } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import renderWithSession from 'tests/renderWithSession'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { DIProvider } from 'utils/injectionDependances'

jest.mock('components/layouts/Sidebar', () => jest.fn(() => <></>))
jest.mock('components/chat/ChatRoom', () => jest.fn(() => <></>))
jest.mock('components/layouts/AlertDisplayer', () => jest.fn(() => <></>))
jest.mock('components/AppHead', () => jest.fn(() => <></>))

const mockAudio = jest.fn()
global.Audio = jest.fn().mockImplementation(() => ({
  play: mockAudio,
}))

describe('<Layout />', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  let updateChatsRef: (chats: JeuneChat[]) => void
  const jeunes: JeuneFromListe[] = desItemsJeunes()
  let jeunesChats: JeuneChat[]
  let jeunesService: JeunesService
  let conseillerService: ConseillerService
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
    ;(useRouter as jest.Mock).mockReturnValue({
      asPath: '/path/to/current/page',
    })
    jeunesService = mockedJeunesService({
      getJeunesDuConseiller: jest.fn(async () => jeunes),
    })
    conseillerService = mockedConseillerService()
    messagesService = mockedMessagesService({
      signIn: jest.fn(() => Promise.resolve()),
      observeConseillerChats: jest.fn((_, jeune, _cle, fn) => {
        updateChatsRef = fn
        updateChatsRef(jeunesChats)
        return () => {}
      }),
    })
  })

  describe('cas nominal', () => {
    beforeEach(async () => {
      await act(async () => {
        await renderWithSession(
          <DIProvider
            dependances={{ jeunesService, conseillerService, messagesService }}
          >
            <ConseillerProvider
              conseiller={unConseiller({ notificationsSonores: true })}
            >
              <Layout>
                <FakeComponent
                  pageTitle='un titre'
                  pageHeader='Titre de la page'
                />
              </Layout>
            </ConseillerProvider>
          </DIProvider>
        )
      })
    })

    it('affiche le titre de la page', () => {
      // Then
      expect(
        screen.getByRole('heading', { level: 1, name: 'Titre de la page' })
      ).toBeInTheDocument()
    })

    it("affiche le fil d'ariane", () => {
      // Then
      expect(screen.getByRole('link', { name: 'path' })).toHaveAttribute(
        'href',
        '/path'
      )
      expect(screen.getByRole('link', { name: 'to' })).toHaveAttribute(
        'href',
        '/path/to'
      )
      expect(screen.getByRole('link', { name: 'current' })).toHaveAttribute(
        'href',
        '/path/to/current'
      )
    })

    it("affiche les messages d'alerte", () => {
      // Then
      expect(AlertDisplayer).toHaveBeenCalledWith({}, {})
    })

    it('signs into chat', () => {
      // Then
      expect(messagesService.signIn).toHaveBeenCalled()
    })

    it('récupère la liste des jeunes du conseiller', () => {
      // Then
      expect(jeunesService.getJeunesDuConseiller).toHaveBeenCalledWith(
        '1',
        'accessToken'
      )
    })

    it('subscribes to chats', () => {
      // Then
      expect(messagesService.observeConseillerChats).toHaveBeenCalledWith(
        '1',
        'cleChiffrement',
        jeunes,
        expect.any(Function)
      )
    })
    // })

    it('paramètre la balise head en fonction des messages non lus', async () => {
      // Then
      expect(AppHead).toHaveBeenCalledWith(
        {
          hasMessageNonLu: true,
          titre: 'un titre',
        },
        {}
      )
    })

    it('affiche la ChatRoom avec les jeunes avec un message non lu en premier', async () => {
      // Then
      expect(ChatRoom).toHaveBeenCalledWith(
        { jeunesChats: [jeunesChats[2], jeunesChats[0], jeunesChats[1]] },
        {}
      )
    })

    it("notifie quand un nouveau message d'un jeune arrive", async () => {
      // Given
      const unJeuneChatNonLu = unJeuneChat({
        ...jeunes[0],
        lastMessageSentBy: 'jeune',
        chatId: `chat-${jeunes[0].id}`,
        lastMessageContent: 'Ceci est tellement nouveau, donne moi de la notif',
      })

      // When
      await act(async () => {
        updateChatsRef([unJeuneChatNonLu])
      })

      // Then
      expect(mockAudio).toHaveBeenCalled()
    })

    it("ne notifie pas quand c'est un évènement de chat qui ne correspond pas à un nouveau message", async () => {
      // Given
      const unJeuneChatNonLu = unJeuneChat({
        ...jeunes[0],
        lastMessageSentBy: 'conseiller',
        chatId: `chat-${jeunes[0].id}`,
        lastMessageContent:
          'Ceci est un message de conseiller, pourquoi notifier ?',
      })

      // When
      await act(async () => {
        updateChatsRef([unJeuneChatNonLu])
      })

      // Then
      expect(mockAudio).toHaveBeenCalledTimes(0)
    })
  })

  describe('quand le conseiller a désactivé ses notifications', () => {
    it("ne notifie pas quand un nouveau message d'un jeune arrive", async () => {
      // Given
      await act(async () => {
        await renderWithSession(
          <DIProvider
            dependances={{ jeunesService, conseillerService, messagesService }}
          >
            <ConseillerProvider
              conseiller={unConseiller({ notificationsSonores: false })}
            >
              <Layout>
                <FakeComponent pageTitle='un titre' />
              </Layout>
            </ConseillerProvider>
          </DIProvider>
        )
      })

      // When
      const unJeuneChatNonLu = unJeuneChat({
        ...jeunes[0],
        lastMessageSentBy: 'jeune',
        chatId: `chat-${jeunes[0].id}`,
        lastMessageContent: 'Ceci est tellement nouveau, donne moi de la notif',
      })
      await act(async () => {
        updateChatsRef([unJeuneChatNonLu])
      })

      // Then
      expect(mockAudio).toHaveBeenCalledTimes(0)
    })
  })

  describe('quand la page nécessite un bouton "retour"', () => {
    it('affiche un bouton "retour"', async () => {
      // When
      await act(async () => {
        await renderWithSession(
          <DIProvider
            dependances={{ jeunesService, conseillerService, messagesService }}
          >
            <ConseillerProvider conseiller={unConseiller()}>
              <Layout>
                <FakeComponent
                  pageTitle='un titre'
                  returnTo='/path/to/previous/page'
                />
              </Layout>
            </ConseillerProvider>
          </DIProvider>
        )
      })

      // Then
      expect(
        screen.getByRole('link', { name: 'Page précédente' })
      ).toHaveAttribute('href', '/path/to/previous/page')
    })
  })

  function FakeComponent(_: PageProps) {
    return null
  }
})
