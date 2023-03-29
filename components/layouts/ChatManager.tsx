import React, { useEffect, useRef, useState } from 'react'

import ChatContainer from 'components/chat/ChatContainer'
import { compareJeuneChat, JeuneChat } from 'interfaces/jeune'
import { MessagesService } from 'services/messages.service'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import { usePortefeuille } from 'utils/portefeuilleContext'

const CHEMIN_DU_SON = '/sounds/notification.mp3'

interface ChatManagerProps {
  displayChat: boolean
  setHasMessageNonLu: (value: boolean) => void
}

export default function ChatManager({
  displayChat,
  setHasMessageNonLu,
}: ChatManagerProps) {
  const messagesService = useDependance<MessagesService>('messagesService')

  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [chatCredentials, setChatCredentials] = useChatCredentials()

  const [chats, setChats] = useState<JeuneChat[]>()
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const destructorRef = useRef<() => void>(() => undefined)

  function hasMessageNonLu(updatedChats: JeuneChat[]): boolean {
    return updatedChats.some(
      (chat) => !chat.seenByConseiller && chat.lastMessageContent
    )
  }

  function aUnNouveauMessage(previousChat: JeuneChat, updatedChat: JeuneChat) {
    return (
      previousChat.lastMessageContent !== updatedChat.lastMessageContent &&
      updatedChat.lastMessageSentBy === 'jeune'
    )
  }

  useEffect(() => {
    // https://github.com/vercel/next.js/discussions/17963
    setAudio(new Audio(CHEMIN_DU_SON))
  }, [])

  useEffect(() => {
    if (!chatCredentials) {
      messagesService
        .getChatCredentials()
        .then((credentials) =>
          messagesService.signIn(credentials.token).then(() => credentials)
        )
        .then(setChatCredentials)
    }
  }, [chatCredentials])

  useEffect(() => {
    if (!chatCredentials || !audio || !portefeuille) return

    messagesService
      .observeConseillerChats(
        chatCredentials.cleChiffrement,
        portefeuille,
        updateChats
      )
      .then((destructor) => (destructorRef.current = destructor))

    return () => destructorRef.current()

    function updateChats(updatedChats: JeuneChat[]) {
      setChats((prevChats: JeuneChat[] | undefined) => {
        if (prevChats) {
          updatedChats.forEach((updatedChat) => {
            const prevChat = prevChats.find(
              (chat) => chat.chatId === updatedChat.chatId
            )

            if (prevChat) {
              if (doitEmettreUnSon(prevChat, updatedChat)) {
                audio?.play()
              }
            }
          })
        }

        return [...updatedChats].sort(compareJeuneChat)
      })
      setHasMessageNonLu(hasMessageNonLu(updatedChats))
    }

    function doitEmettreUnSon(previousChat: JeuneChat, updatedChat: JeuneChat) {
      return (
        conseiller.notificationsSonores &&
        aUnNouveauMessage(previousChat, updatedChat)
      )
    }
  }, [portefeuille, chatCredentials, audio, conseiller.notificationsSonores])

  return displayChat ? <ChatContainer jeunesChats={chats} /> : <></>
}
