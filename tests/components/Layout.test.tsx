import { act, render, screen } from '@testing-library/react'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React from 'react'

import AppHead from 'components/AppHead'
import ChatContainer from 'components/chat/ChatContainer'
import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import Layout from 'components/layouts/Layout'
import { unConseiller } from 'fixtures/conseiller'
import { desItemsJeunes, extractBaseJeune, unJeuneChat } from 'fixtures/jeune'
import { compareJeunesByNom, JeuneChat, JeuneFromListe } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { getConseillerClientSide } from 'services/conseiller.service'
import { getJeunesDuConseillerClientSide } from 'services/jeunes.service'
import {
  getChatCredentials,
  observeConseillerChats,
  signIn,
} from 'services/messages.service'
import renderWithContexts from 'tests/renderWithContexts'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

jest.mock('services/jeunes.service')
jest.mock('services/conseiller.service')
jest.mock('services/messages.service')
jest.mock('components/layouts/SidebarLayout', () => jest.fn(() => <></>))
jest.mock('components/chat/ChatContainer', () => jest.fn(() => <></>))
jest.mock('components/layouts/AlerteDisplayer', () => jest.fn(() => <></>))
jest.mock('components/AppHead', () => jest.fn(() => <></>))

const mockAudio = jest.fn()
// @ts-ignore
global.Audio = class FakeAudio {
  play = mockAudio
}

describe('<Layout />', () => {
  let updateChatsRef: (chats: JeuneChat[]) => void
  const jeunes: JeuneFromListe[] = desItemsJeunes()
  let jeunesChats: JeuneChat[]

  beforeEach(async () => {
    const now = DateTime.now()
    jest.spyOn(DateTime, 'now').mockReturnValue(now)

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
    ;(getJeunesDuConseillerClientSide as jest.Mock).mockResolvedValue(jeunes)
    ;(getConseillerClientSide as jest.Mock).mockResolvedValue(
      unConseiller({ notificationsSonores: true })
    )
    ;(getChatCredentials as jest.Mock).mockResolvedValue({
      token: 'tokenFirebase',
      cleChiffrement: 'cleChiffrement',
    })
    ;(signIn as jest.Mock).mockResolvedValue({})
    ;(observeConseillerChats as jest.Mock).mockImplementation(
      (jeune, _cle, fn) => {
        updateChatsRef = fn
        updateChatsRef(jeunesChats)
        return Promise.resolve(() => {})
      }
    )
  })

  describe('cas nominal', () => {
    beforeEach(async () => {
      await act(async () => {
        render(
          <ConseillerProvider>
            <PortefeuilleProvider>
              <ChatCredentialsProvider>
                <Layout>
                  <FakeComponent
                    pageTitle='un titre'
                    pageHeader='Titre de la page'
                  />
                </Layout>
              </ChatCredentialsProvider>
            </PortefeuilleProvider>
          </ConseillerProvider>
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
      expect(
        screen.getByRole('link', { name: 'Fiche bénéficiaire' })
      ).toHaveAttribute('href', '/mes-jeunes/id-jeune')
      expect(
        screen.getByRole('link', { name: 'Détail action' })
      ).toHaveAttribute('href', '/mes-jeunes/id-jeune/actions/id-action')
    })

    it("affiche les messages d'alerte", () => {
      // Then
      expect(AlerteDisplayer).toHaveBeenCalledWith({}, {})
    })

    it('récupère le conseiller', async () => {
      // Then
      expect(getConseillerClientSide).toHaveBeenCalledWith()
    })

    it('récupère la liste des jeunes du conseiller', () => {
      // Then
      expect(getJeunesDuConseillerClientSide).toHaveBeenCalledWith()
    })

    it('récupère les informations pour contacter firebase', async () => {
      // Then
      expect(getChatCredentials).toHaveBeenCalledWith()
    })

    it('signs into chat', () => {
      // Then
      expect(signIn).toHaveBeenCalledWith('tokenFirebase')
    })

    it('subscribes to chats', () => {
      // Then
      expect(observeConseillerChats).toHaveBeenCalledWith(
        'cleChiffrement',
        jeunes.map(extractBaseJeune).sort(compareJeunesByNom),
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

    it('affiche le ChatContainer avec les jeunes avec un message non lu en premier', async () => {
      // Then
      expect(ChatContainer).toHaveBeenCalledWith(
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
        renderWithContexts(
          <Layout>
            <FakeComponent pageTitle='un titre' />
          </Layout>,
          {
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

  describe('quand la page nécessite un lien de retour', () => {
    it('affiche un lien vers la page demandée', async () => {
      // When
      await act(async () => {
        renderWithContexts(
          <Layout>
            <FakeComponent
              pageTitle='un titre'
              returnTo='/mes-jeunes/id-jeune/actions/id-action'
            />
          </Layout>,
          {}
        )
      })

      // Then
      expect(
        screen.getByRole('link', { name: 'Retour à Détail action' })
      ).toHaveAttribute('href', '/mes-jeunes/id-jeune/actions/id-action')
    })
  })

  function FakeComponent(_: PageProps) {
    return null
  }
})
