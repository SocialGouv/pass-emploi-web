/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { ReactElement, useEffect, useRef, useState } from 'react'

import AppHead from 'components/AppHead'
import { Footer } from 'components/Footer'
import ChatRoom from 'components/layouts/ChatRoom'
import Sidebar from 'components/layouts/Sidebar'
import { compareJeuneChat, JeuneChat } from 'interfaces/jeune'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import useSession from 'utils/auth/useSession'
import { useChatCreds } from 'utils/chat/chatCredsContext'
import { useDependance } from 'utils/injectionDependances'

type LayoutProps = {
  children: ReactElement
}

export default function Layout({ children }: LayoutProps) {
  const {
    props: { withoutChat, pageTitle },
  } = children

  const messagesService = useDependance<MessagesService>('messagesService')
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const { data: session } = useSession<true>({ required: true })
  const [chatCreds, setChatCreds] = useChatCreds()
  const [chats, setChats] = useState<JeuneChat[]>([])
  const destructorsRef = useRef<(() => void)[]>([])

  function updateChats(updatedChat: JeuneChat) {
    setChats((prevChats) => {
      const chatIndex = prevChats.findIndex(
        (chat) => chat.chatId === updatedChat.chatId
      )
      const updatedChats = [...prevChats]
      if (chatIndex !== -1) {
        updatedChats[chatIndex] = updatedChat
      } else {
        updatedChats.push(updatedChat)
      }
      updatedChats.sort(compareJeuneChat)
      return updatedChats
    })
  }

  function hasMessageNonLu(): boolean {
    return chats.some(
      (chat) => !chat.seenByConseiller && chat.lastMessageContent
    )
  }

  useEffect(() => {
    if (session && !chatCreds) {
      messagesService.getChatCredentials(session.accessToken).then(setChatCreds)
    }
  }, [session, chatCreds, messagesService, setChatCreds])

  useEffect(() => {
    if (!session || !chatCreds) return

    const { user, accessToken } = session
    messagesService
      .signIn(chatCreds.token)
      .then(() => jeunesService.getJeunesDuConseiller(user.id, accessToken))
      .then((jeunes) =>
        jeunes.map((jeune) =>
          messagesService.observeJeuneChat(
            user.id,
            jeune,
            chatCreds.cleChiffrement,
            updateChats
          )
        )
      )
      .then((destructors) => (destructorsRef.current = destructors))

    return () => destructorsRef.current.forEach((destructor) => destructor())
  }, [session, jeunesService, messagesService, chatCreds])

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
