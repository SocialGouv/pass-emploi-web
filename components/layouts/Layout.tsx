/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { ReactElement, useEffect, useRef, useState } from 'react'

import AppHead from '../AppHead'

import ChatRoom from './ChatRoom'
import Sidebar from './Sidebar'

import { Footer } from 'components/Footer'
import { compareJeuneChat, JeuneChat } from 'interfaces/jeune'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import useSession from 'utils/auth/useSession'
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
    if (!session) return

    const { user, accessToken, firebaseToken } = session
    if (firebaseToken) {
      messagesService
        .signIn(firebaseToken)
        .then(() => jeunesService.getJeunesDuConseiller(user.id, accessToken))
        .then((jeunes) =>
          jeunes.map((jeune) =>
            messagesService.observeJeuneChat(user.id, jeune, updateChats)
          )
        )
        .then((destructors) => (destructorsRef.current = destructors))
    }

    return () => destructorsRef.current.forEach((destructor) => destructor())
  }, [session, jeunesService, messagesService])

  return (
    <>
      <div
        className={`${styles.container} ${
          !withoutChat ? styles.container_with_chat : ''
        }`}
      >
        <Sidebar />
        <div className={styles.page}>
          <AppHead hasMessageNonLu={hasMessageNonLu()} titre={pageTitle} />
          <main role='main'>{children}</main>
          <Footer />
        </div>
        {!withoutChat && <ChatRoom jeunesChats={chats} />}
      </div>
      <div id='modal-root' />
    </>
  )
}
