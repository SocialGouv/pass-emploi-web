import React, { useEffect, useRef, useState } from 'react'

import ChatRoom from './ChatRoom'

import { compareJeuneChat, JeuneChat } from 'interfaces/jeune'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import useSession from 'utils/auth/useSession'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'

const CHEMIN_DU_SON = '/sounds/notification.mp3'

export default function ChatContainer({
  withChat,
  setHasMessageNonLu,
}: {
  withChat: boolean
  setHasMessageNonLu: (value: boolean) => void
}) {
  const messagesService = useDependance<MessagesService>('messagesService')
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')

  const { data: session } = useSession<true>({ required: true })
  const [chatCredentials, setChatCredentials] = useChatCredentials()
  const [conseiller, setConseiller] = useConseiller()

  const [chats, setChats] = useState<JeuneChat[]>([])
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const destructorRef = useRef<() => void>(() => undefined)

  function hasMessageNonLu(): boolean {
    return chats.some(
      (chat) => !chat.seenByConseiller && chat.lastMessageContent
    )
  }

  setHasMessageNonLu(hasMessageNonLu())

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
    if (session && !chatCredentials) {
      messagesService
        .getChatCredentials(session.accessToken)
        .then(setChatCredentials)
    }
  }, [session, chatCredentials, messagesService, setChatCredentials])

  useEffect(() => {
    if (session && !conseiller) {
      conseillerService
        .getConseiller(session.user.id, session.accessToken)
        .then(setConseiller)
    }
  }, [session, conseiller, conseillerService, setConseiller])

  useEffect(() => {
    if (!session || !chatCredentials || !conseiller || !audio) return
    const { user, accessToken } = session
    messagesService
      .signIn(chatCredentials.token)
      .then(() => jeunesService.getJeunesDuConseiller(user.id, accessToken))
      .then((jeunes) =>
        messagesService.observeConseillerChats(
          user.id,
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
          const chatIndex = prevChats.findIndex(
            (chat) => chat.chatId === updatedChat.chatId
          )

          if (chatIndex !== -1) {
            if (doitEmettreUnSon(prevChats[chatIndex], updatedChat)) {
              audio?.play()
            }
          }
        })

        return [...updatedChats].sort(compareJeuneChat)
      })
    }

    function doitEmettreUnSon(previousChat: JeuneChat, updatedChat: JeuneChat) {
      return (
        conseiller?.notificationsSonores &&
        aUnNouveauMessage(previousChat, updatedChat)
      )
    }
  }, [
    session,
    jeunesService,
    messagesService,
    chatCredentials,
    audio,
    conseiller,
  ])

  return withChat ? <ChatRoom jeunesChats={chats} /> : <></>
}
