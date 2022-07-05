/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { useRouter } from 'next/router'
import React, { ReactElement, useEffect, useRef, useState } from 'react'

import AppHead from 'components/AppHead'
import ChatRoom from 'components/layouts/ChatRoom'
import { Footer } from 'components/layouts/Footer'
import { Header } from 'components/layouts/Header'
import Sidebar from 'components/layouts/Sidebar'
import { compareJeuneChat, JeuneChat } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import useSession from 'utils/auth/useSession'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'

interface LayoutProps {
  children: ReactElement<PageProps>
}

const CHEMIN_DU_SON = '/sounds/notification.mp3'

export default function Layout({ children }: LayoutProps) {
  const {
    props: {
      pageTitle,
      pageHeader,
      returnTo,
      withoutChat,
      messageEnvoiGroupeSuccess,
    },
  } = children

  const router = useRouter()
  const messagesService = useDependance<MessagesService>('messagesService')
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')

  const { data: session } = useSession<true>({ required: true })
  const [chatCredentials, setChatCredentials] = useChatCredentials()
  const [conseiller, setConseiller] = useConseiller()

  const [chats, setChats] = useState<JeuneChat[]>([])
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const destructorsRef = useRef<(() => void)[]>([])

  const withChat = !withoutChat

  function hasMessageNonLu(): boolean {
    return chats.some(
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

    function updateChats(updatedChat: JeuneChat) {
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(
          (chat) => chat.chatId === updatedChat.chatId
        )
        const updatedChats = [...prevChats]

        if (chatIndex !== -1) {
          if (doitEmettreUnSon(prevChats[chatIndex], updatedChat)) {
            audio?.play()
          }
          updatedChats[chatIndex] = updatedChat
        } else {
          updatedChats.push(updatedChat)
        }
        updatedChats.sort(compareJeuneChat)
        return updatedChats
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

  useEffect(() => {
    // https://dev.to/admitkard/mobile-issue-with-100vh-height-100-100vh-3-solutions-3nae

    function resizeContainerToInnerHeight() {
      if (containerRef.current) {
        containerRef.current.style.height = `${window.innerHeight}px`
        containerRef.current.style.gridTemplateRows = `${window.innerHeight}px`
      }
    }

    resizeContainerToInnerHeight()
    window.addEventListener('resize', resizeContainerToInnerHeight, true)
    return () =>
      window.removeEventListener('resize', resizeContainerToInnerHeight, true)
  }, [])

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo(0, 0)
  }, [router.asPath, mainRef])

  return (
    <>
      <AppHead hasMessageNonLu={hasMessageNonLu()} titre={pageTitle} />
      <div
        ref={containerRef}
        className={`${styles.container} ${
          withChat ? styles.container_with_chat : ''
        }`}
      >
        <Sidebar />
        <div ref={mainRef} className={styles.page}>
          <Header
            currentPath={router.asPath}
            returnTo={returnTo}
            pageHeader={pageHeader ?? pageTitle}
          />

          <main
            role='main'
            className={`${styles.content} ${
              withChat ? styles.content_when_chat : ''
            }`}
          >
            {children}
          </main>

          <Footer />
        </div>
        {withChat && (
          <ChatRoom
            jeunesChats={chats}
            messageEnvoiGroupeSuccess={messageEnvoiGroupeSuccess}
          />
        )}
      </div>
      <div id='modal-root' />
    </>
  )
}
