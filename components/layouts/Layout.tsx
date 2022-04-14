/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { Footer } from 'components/Footer'
import { JeuneChat } from 'interfaces/jeune'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import useSession from 'utils/auth/useSession'
import { useDependance } from 'utils/injectionDependances'
import AppHead from '../AppHead'
import ChatRoom from './ChatRoom'
import Sidebar from './Sidebar'

type LayoutProps = {
  children: ReactElement
}

export default function Layout({ children }: LayoutProps) {
  const {
    props: { withoutChat, pageTitle },
  } = children

  const { data: session } = useSession<true>({ required: true })
  const [hasMessageNonLu, setHasMessageNonLu] = useState<boolean>(false)

  const messagesService = useDependance<MessagesService>('messagesService')
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const destructorsRef = useRef<(() => void)[]>([])

  function verifierMessageNonLu(updatedChat: JeuneChat, chats: JeuneChat[]) {
    const chatIndex = chats.findIndex(
      (chat) => chat.chatId === updatedChat.chatId
    )
    if (chatIndex > -1) {
      chats[chatIndex] = updatedChat
    } else {
      chats.push(updatedChat)
    }
    if (
      chats.some((chat) => !chat.seenByConseiller && chat.lastMessageContent)
    ) {
      setHasMessageNonLu(true)
    } else {
      setHasMessageNonLu(false)
    }
  }

  //TODO optimiser avec l'obesrvable mis en place dans la chatRoom
  useEffect(() => {
    if (!session) return
    const chats: JeuneChat[] = []

    const { user, accessToken, firebaseToken } = session
    if (firebaseToken) {
      messagesService
        .signIn(firebaseToken)
        .then(() => {
          return jeunesService.getJeunesDuConseiller(user.id, accessToken)
        })
        .then((jeunes) => {
          return jeunes.map((jeune) =>
            messagesService.observeJeuneChat(user.id, jeune, (updatedChat) =>
              verifierMessageNonLu(updatedChat, chats)
            )
          )
        })
        .then((destructors) => (destructorsRef.current = destructors))
    }

    return () => destructorsRef.current.forEach((destructor) => destructor())
  }, [jeunesService, messagesService, session])

  return (
    <>
      <div
        className={`${styles.container} ${
          !withoutChat ? styles.container_with_chat : ''
        }`}
      >
        <Sidebar />
        <div className={styles.page}>
          <AppHead hasMessageNonLu={hasMessageNonLu} titre={pageTitle} />
          <main role='main'>{children}</main>
          <Footer />
        </div>
        {!withoutChat && <ChatRoom />}
      </div>
      <div id='modal-root' />
    </>
  )
}
