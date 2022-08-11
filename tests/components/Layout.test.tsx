import { act, render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import React from 'react'

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
import renderWithContexts from 'tests/renderWithContexts'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
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
      asPath: '/mes-jeunes/id-jeune/actions/id-action',
      route: '/mes-jeunes/[jeune_id]/actions/[action_id]',
    })
    jeunesService = mockedJeunesService({
      getJeunesDuConseillerClientSide: jest.fn(async () => jeunes),
    })
    conseillerService = mockedConseillerService({
      getConseillerClientSide: jest.fn(async () =>
        unConseiller({ notificationsSonores: true })
      ),
    })
    messagesService = mockedMessagesService({
      signIn: jest.fn(() => Promise.resolve()),
      observeConseillerChats: jest.fn((jeune, _cle, fn) => {
        updateChatsRef = fn
        updateChatsRef(jeunesChats)
        return Promise.resolve(() => {})
      }),
    })
  })

  describe('cas nominal', () => {
    beforeEach(async () => {
      await act(async () => {
        await renderWithContexts(
          <Layout>
            <FakeComponent pageTitle='un titre' pageHeader='Titre de la page' />
          </Layout>,
          {
            customDependances: {
              jeunesService,
              conseillerService,
              messagesService,
            },
            customConseiller: { notificationsSonores: true },
          }
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
      expect(
        screen.getByRole('link', { name: 'Portefeuille' })
      ).toHaveAttribute('href', '/mes-jeunes')
      expect(screen.getByRole('link', { name: 'Fiche jeune' })).toHaveAttribute(
        'href',
        '/mes-jeunes/id-jeune'
      )
      expect(
        screen.getByRole('link', { name: 'Détail action' })
      ).toHaveAttribute('href', '/mes-jeunes/id-jeune/actions/id-action')
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
      expect(
        jeunesService.getJeunesDuConseillerClientSide
      ).toHaveBeenCalledWith()
    })

    it('subscribes to chats', () => {
      // Then
      expect(messagesService.observeConseillerChats).toHaveBeenCalledWith(
        'cleChiffrement',
        jeunes,
        expect.any(Function)
      )
    })

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

  describe("quand le conseiller n'a pas éte récupéré", () => {
    it('récupère le conseiller', async () => {
      // When
      await act(async () => {
        render(
          <DIProvider
            dependances={{
              jeunesService,
              conseillerService,
              messagesService,
            }}
          >
            <ConseillerProvider>
              <ChatCredentialsProvider
                credentials={{
                  token: 'firebaseToken',
                  cleChiffrement: 'cleChiffrement',
                }}
              >
                <Layout>
                  <FakeComponent
                    pageTitle='un titre'
                    pageHeader='Titre de la page'
                  />
                </Layout>
              </ChatCredentialsProvider>
            </ConseillerProvider>
          </DIProvider>
        )
      })

      // Then
      expect(conseillerService.getConseillerClientSide).toHaveBeenCalledWith()
    })
  })

  describe('quand le conseiller a désactivé ses notifications', () => {
    it("ne notifie pas quand un nouveau message d'un jeune arrive", async () => {
      // Given
      await act(async () => {
        renderWithContexts(
          <Layout>
            <FakeComponent pageTitle='un titre' />
          </Layout>,
          {
            customDependances: {
              jeunesService,
              conseillerService,
              messagesService,
            },
            customConseiller: unConseiller({ notificationsSonores: false }),
          }
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
        renderWithContexts(
          <Layout>
            <FakeComponent
              pageTitle='un titre'
              returnTo='/path/to/previous/page'
            />
          </Layout>,
          {
            customDependances: {
              jeunesService,
              conseillerService,
              messagesService,
            },
          }
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
