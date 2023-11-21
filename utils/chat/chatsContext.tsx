'use client'

import { usePathname } from 'next/navigation'
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import { compareJeuneChat, JeuneChat } from 'interfaces/jeune'
import { ChatCredentials } from 'interfaces/message'
import {
  getChatCredentials,
  observeConseillerChats,
  signIn,
} from 'services/messages.service'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const CHEMIN_DU_SON = '/sounds/notification.mp3'

const ChatsContext = createContext<JeuneChat[] | undefined>(undefined)

export function ChatsProvider({ children }: { children: ReactNode }) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const pathname = usePathname()

  const [titleBackup, setTitleBackup] = useState<string | undefined>()
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const [chatCredentials, setChatCredentials] = useState<ChatCredentials>()
  const [chats, setChats] = useState<JeuneChat[]>()
  const [hasMessageNonLu, setHasMessageNonLu] = useState<boolean>(false)

  const destructorRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    setAudio(new Audio(CHEMIN_DU_SON))
  }, [])

  useEffect(() => {
    if (!chatCredentials) {
      getChatCredentials()
        .then((credentials) =>
          signIn(credentials.token).then(() => credentials)
        )
        .then(setChatCredentials)
    }
  }, [chatCredentials])

  useEffect(() => {
    if (!chatCredentials || !audio || !portefeuille) return

    observeConseillerChats(
      chatCredentials.cleChiffrement,
      portefeuille,
      updateChats
    ).then((destructor) => (destructorRef.current = destructor))

    return () => destructorRef.current()

    function updateChats(updatedChats: JeuneChat[]) {
      setChats((prevChats: JeuneChat[] | undefined) => {
        if (prevChats) {
          updatedChats.forEach((updatedChat) => {
            const prevChat = prevChats.find(
              (chat) => chat.chatId === updatedChat.chatId
            )

            if (
              prevChat &&
              aUnNouveauMessage(prevChat, updatedChat) &&
              conseiller.notificationsSonores
            ) {
              audio?.play()
            }
          })
        }

        return [...updatedChats].sort(compareJeuneChat)
      })

      setHasMessageNonLu(
        updatedChats.some(
          (chat) => !chat.seenByConseiller && chat.lastMessageContent
        )
      )
    }
  }, [portefeuille, chatCredentials, audio, conseiller.notificationsSonores])

  useEffect(() => {
    if (titleBackup) setTitleBackup(document.title)
  }, [pathname])

  useEffect(() => {
    if (!hasMessageNonLu && titleBackup !== undefined) {
      resetBrowserTab(titleBackup)
      setTitleBackup(undefined)
    }

    if (hasMessageNonLu && titleBackup === undefined) {
      setTitleBackup(document.title)
      displayNotificationInBrowserTab()
    }
  }, [hasMessageNonLu, titleBackup])

  return (
    <ChatCredentialsProvider credentials={chatCredentials}>
      <ChatsContext.Provider value={chats}>{children}</ChatsContext.Provider>
    </ChatCredentialsProvider>
  )
}

export function useChats(): JeuneChat[] | undefined {
  return useContext(ChatsContext)
}

function aUnNouveauMessage(previousChat: JeuneChat, updatedChat: JeuneChat) {
  return (
    previousChat.lastMessageContent !== updatedChat.lastMessageContent &&
    updatedChat.lastMessageSentBy === 'jeune'
  )
}

function displayNotificationInBrowserTab() {
  const siteTitle = document.title.split(' - ').at(-1)
  document.title = 'Nouveau(x) message(s) - ' + siteTitle
  const faviconLink: HTMLLinkElement =
    document.querySelector("link[rel='icon']")!
  faviconLink.href = '/favicon_notif.png'
}

function resetBrowserTab(backupTitle: string) {
  document.title = backupTitle
  const faviconLink: HTMLLinkElement =
    document.querySelector("link[rel='icon']")!
  faviconLink.href = '/favicon.png'
}
