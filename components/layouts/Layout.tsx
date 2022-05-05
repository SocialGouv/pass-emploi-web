/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import AppHead from 'components/AppHead'
import { Footer } from 'components/Footer'
import ChatRoom from 'components/layouts/ChatRoom'
import Sidebar from 'components/layouts/Sidebar'
import { Chat, compareJeuneChat, Jeune, JeuneChat } from 'interfaces/jeune'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import useSession from 'utils/auth/useSession'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useDependance } from 'utils/injectionDependances'

type LayoutProps = {
  children: ReactElement
}

const CHEMIN_DU_SON = '/sounds/notification.mp3'

export default function Layout({ children }: LayoutProps) {
  const {
    props: { withoutChat, pageTitle },
  } = children

  const messagesService = useDependance<MessagesService>('messagesService')
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const { data: session } = useSession<true>({ required: true })
  const [chatCredentials, setChatCredentials] = useChatCredentials()
  const [chats, setChats] = useState<JeuneChat[]>([])
  const destructorsRef = useRef<(() => void)[]>([])
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const updateChats = useCallback(
    (updatedChat: JeuneChat) => {
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(
          (chat) => chat.chatId === updatedChat.chatId
        )
        const updatedChats = [...prevChats]

        if (chatIndex !== -1) {
          if (aUnNouveauMessage(prevChats[chatIndex], updatedChat)) {
            audio?.play()
          }
          updatedChats[chatIndex] = updatedChat
        } else {
          updatedChats.push(updatedChat)
        }
        updatedChats.sort(compareJeuneChat)
        return updatedChats
      })
    },
    [audio]
  )

  function hasMessageNonLu(): boolean {
    return chats.some(
      (chat) => !chat.seenByConseiller && chat.lastMessageContent
    )
  }

  function aUnNouveauMessage(
    previousChat: Jeune & Chat,
    updatedChat: Jeune & Chat
  ) {
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
    if (!session || !chatCredentials) return
    const { user, accessToken } = session
    messagesService
      .signIn(chatCredentials.token)
      .then(() => jeunesService.getJeunesDuConseiller(user.id, accessToken))
      .then((jeunes) =>
        jeunes.map((jeune) =>
          messagesService.observeJeuneChat(
            user.id,
            jeune,
            chatCredentials.cleChiffrement,
            updateChats
          )
        )
      )
      .then((destructors) => (destructorsRef.current = destructors))

    return () => destructorsRef.current.forEach((destructor) => destructor())
  }, [session, jeunesService, messagesService, chatCredentials, updateChats])

  return (
    <>
      <AppHead hasMessageNonLu={hasMessageNonLu()} titre={pageTitle} />
      <div
        className={`${styles.container} ${
          !withoutChat ? styles.container_with_chat : ''
        }`}
      >
        <Sidebar />
        <div className={styles.page}>
          <main role='main'>{children}</main>
          <Footer />
        </div>
        {!withoutChat && <ChatRoom jeunesChats={chats} />}
      </div>
      <div id='modal-root' />
    </>
  )
}
