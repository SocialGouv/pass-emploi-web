import React, { useEffect, useRef, useState } from 'react'

import ChatRoom from 'components/chat/ChatRoom'
import { compareJeuneChat, JeuneChat } from 'interfaces/jeune'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'

const CHEMIN_DU_SON = '/sounds/notification.mp3'

interface ChatContainerProps {
  displayChat: boolean
  setHasMessageNonLu: (value: boolean) => void
}

export default function ChatContainer({
  displayChat,
  setHasMessageNonLu,
}: ChatContainerProps) {
  const messagesService = useDependance<MessagesService>('messagesService')
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const [chatCredentials, setChatCredentials] = useChatCredentials()
  const [conseiller] = useConseiller()

  const [chats, setChats] = useState<JeuneChat[]>([])
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
      messagesService.getChatCredentials().then(setChatCredentials)
    }
  }, [chatCredentials, messagesService, setChatCredentials])

  useEffect(() => {
    if (!chatCredentials || !conseiller || !audio) return
    messagesService
      .signIn(chatCredentials.token)
      .then(() => jeunesService.getJeunesDuConseillerClientSide())
      .then((jeunes) =>
        messagesService.observeConseillerChats(
          chatCredentials.cleChiffrement,
          jeunes,
          updateChats
        )
      )
      .then((destructor) => (destructorRef.current = destructor))

    return () => destructorRef.current()

    function updateChats(updatedChats: JeuneChat[]) {
      setChats((prevChats) => {
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

        return [...updatedChats].sort(compareJeuneChat)
      })
      setHasMessageNonLu(hasMessageNonLu(updatedChats))
    }

    function doitEmettreUnSon(previousChat: JeuneChat, updatedChat: JeuneChat) {
      return (
        conseiller?.notificationsSonores &&
        aUnNouveauMessage(previousChat, updatedChat)
      )
    }
  }, [
    messagesService,
    chatCredentials,
    audio,
    conseiller,
    setHasMessageNonLu,
    jeunesService,
  ])

  return displayChat ? <ChatRoom jeunesChats={chats} /> : <></>
}
