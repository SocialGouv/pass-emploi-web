import { RenderResult, act, render, screen } from '@testing-library/react'
import React from 'react'

import {
  desItemsBeneficiaires,
  extractBaseBeneficiaire,
  unBeneficiaireChat,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { BeneficiaireEtChat } from 'interfaces/beneficiaire'
import { observeConseillerChats } from 'services/messages.service'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { ChatsProvider } from 'utils/chat/chatsContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

jest.mock('services/messages.service')

const mockAudio = jest.fn()
// @ts-ignore
global.Audio = class FakeAudio {
  play = mockAudio
}

describe('ChatsProvider', () => {
  let updateChatsRef: (chats: BeneficiaireEtChat[]) => void
  const portefeuille = desItemsBeneficiaires().map(extractBaseBeneficiaire)
  const conversations = [
    unBeneficiaireChat({
      ...portefeuille[0],
      chatId: `chat-${portefeuille[0].id}`,
      seenByConseiller: true,
    }),
    unBeneficiaireChat({
      ...portefeuille[1],
      chatId: `chat-${portefeuille[1].id}`,
      seenByConseiller: true,
    }),
    unBeneficiaireChat({
      ...portefeuille[2],
      chatId: `chat-${portefeuille[2].id}`,
      seenByConseiller: false,
    }),
  ]

  beforeEach(async () => {
    // When
    ;(observeConseillerChats as jest.Mock).mockImplementation(
      (_jeune, _cle, fn) => {
        updateChatsRef = fn
        updateChatsRef(conversations)
        return Promise.resolve(() => {})
      }
    )
    document.title = 'Titre page'
  })

  describe('cas nominal', () => {
    const conseiller = unConseiller({ notificationsSonores: true })
    const credentials = {
      token: 'tokenFirebase',
      cleChiffrement: 'cleChiffrement',
    }
    let renderResult: RenderResult
    beforeEach(async () => {
      // When
      renderResult = await act(async () =>
        render(
          <>
            <link rel='icon' href='/cej-favicon.png' />
            <ConseillerProvider conseiller={conseiller}>
              <PortefeuilleProvider portefeuille={portefeuille}>
                <ChatCredentialsProvider credentials={credentials}>
                  <ChatsProvider>
                    <div />
                  </ChatsProvider>
                </ChatCredentialsProvider>
              </PortefeuilleProvider>
            </ConseillerProvider>
          </>
        )
      )
    })

    it('observe les conversations', () => {
      // Then
      expect(observeConseillerChats).toHaveBeenCalledWith(
        'cleChiffrement',
        portefeuille.map(extractBaseBeneficiaire),
        expect.any(Function)
      )
    })

    it('affiche une notification dans l’onglet s’il y a des messages non lus', async () => {
      // Then
      expect(
        renderResult.container.querySelector("link[rel='icon']")
      ).toHaveProperty('href', 'http://localhost/cej-favicon-notif.png')
      expect(document.title).toMatch(/Nouveau\(x\) message\(s\) - /)
    })

    it("notifie quand un nouveau message d'un jeune arrive", async () => {
      // Given
      const unJeuneChatNonLu = unBeneficiaireChat({
        ...portefeuille[0],
        lastMessageSentBy: 'jeune',
        chatId: `chat-${portefeuille[0].id}`,
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
      const unJeuneChatNonLu = unBeneficiaireChat({
        ...portefeuille[0],
        lastMessageSentBy: 'conseiller',
        chatId: `chat-${portefeuille[0].id}`,
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
      const conseiller = unConseiller({ notificationsSonores: false })

      // When
      await act(async () =>
        render(
          <>
            <link rel='icon' href='/cej-favicon.png' />
            <ConseillerProvider conseiller={conseiller}>
              <PortefeuilleProvider portefeuille={portefeuille}>
                <ChatsProvider>
                  <div />
                </ChatsProvider>
              </PortefeuilleProvider>
            </ConseillerProvider>
          </>
        )
      )

      // When
      const unJeuneChatNonLu = unBeneficiaireChat({
        ...portefeuille[0],
        lastMessageSentBy: 'jeune',
        chatId: `chat-${portefeuille[0].id}`,
        lastMessageContent: 'Ceci est tellement nouveau, donne moi de la notif',
      })
      await act(async () => {
        updateChatsRef([unJeuneChatNonLu])
      })

      // Then
      expect(mockAudio).toHaveBeenCalledTimes(0)
    })
  })
})
