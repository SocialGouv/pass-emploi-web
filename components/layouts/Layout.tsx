/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import Link from 'next/link'
import React, { ReactElement, useEffect, useRef, useState } from 'react'

import BackIcon from '../../assets/icons/arrow_back.svg'

import AppHead from 'components/AppHead'
import { Footer } from 'components/Footer'
import ChatRoom from 'components/layouts/ChatRoom'
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
    props: { pageTitle, pageHeader, returnTo, withoutChat },
  } = children

  const messagesService = useDependance<MessagesService>('messagesService')
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')

  const { data: session } = useSession<true>({ required: true })
  const [chatCredentials, setChatCredentials] = useChatCredentials()
  const [conseiller, setConseiller] = useConseiller()
  const [chats, setChats] = useState<JeuneChat[]>([])
  const destructorsRef = useRef<(() => void)[]>([])
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

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
          <header className={styles.header}>
            {returnTo && (
              <div className='flex items-center'>
                <Link href={returnTo}>
                  <a>
                    <BackIcon aria-hidden={true} focusable={false} />
                    <span className='sr-only'>Page précédente</span>
                  </a>
                </Link>
                <h1 className='ml-4 h2-semi text-primary'>
                  {pageHeader || pageTitle}
                </h1>
              </div>
            )}
            {!returnTo && (
              <h1 className='h2-semi text-primary'>
                {pageHeader || pageTitle}
              </h1>
            )}
          </header>

          <main
            role='main'
            className={`${styles.content} ${
              withoutChat ? styles.content_without_chat : ''
            }`}
          >
            {children}
          </main>

          <Footer />
        </div>
        {!withoutChat && <ChatRoom jeunesChats={chats} />}
      </div>
      <div id='modal-root' />
    </>
  )
}
