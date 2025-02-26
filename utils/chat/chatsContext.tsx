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

import {
  BeneficiaireEtChat,
  compareBeneficiaireChat,
} from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import { estPassEmploi } from 'interfaces/structure'
import { observeConseillerChats } from 'services/messages.service'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const CHEMIN_DU_SON = '/sounds/notification.mp3'

const ChatsContext = createContext<BeneficiaireEtChat[] | undefined>(undefined)

export function ChatsProvider({
  children,
  chatsForTests,
}: {
  children: ReactNode
  chatsForTests?: BeneficiaireEtChat[]
}) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const chatCredentials = useChatCredentials()
  const pathname = usePathname()

  const [titleBackup, setTitleBackup] = useState<string | undefined>()
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const [chats, setChats] = useState<BeneficiaireEtChat[]>()
  const [hasMessageNonLu, setHasMessageNonLu] = useState<boolean>(false)

  const destructorRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    setAudio(new Audio(CHEMIN_DU_SON))
  }, [])

  useEffect(() => {
    if (chatsForTests) {
      setChats(chatsForTests)
      return
    }
    if (!chatCredentials || !audio || !portefeuille) return

    observeConseillerChats(
      chatCredentials.cleChiffrement,
      portefeuille,
      updateChats
    ).then((destructor) => (destructorRef.current = destructor))

    return () => destructorRef.current()

    function updateChats(updatedChats: BeneficiaireEtChat[]) {
      setChats((prevChats: BeneficiaireEtChat[] | undefined) => {
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

        return [...updatedChats].sort(compareBeneficiaireChat)
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
      displayNotificationInBrowserTab(conseiller)
    }
  }, [hasMessageNonLu, titleBackup])

  return <ChatsContext.Provider value={chats}>{children}</ChatsContext.Provider>
}

export function useChats(): BeneficiaireEtChat[] | undefined {
  return useContext(ChatsContext)
}

function aUnNouveauMessage(
  previousChat: BeneficiaireEtChat,
  updatedChat: BeneficiaireEtChat
) {
  return (
    previousChat.lastMessageContent !== updatedChat.lastMessageContent &&
    updatedChat.lastMessageSentBy === 'jeune'
  )
}

function displayNotificationInBrowserTab(conseiller: Conseiller) {
  const siteTitle = document.title.split(' - ').at(-1)
  document.title = 'Nouveau(x) message(s) - ' + siteTitle
  const faviconLink: HTMLLinkElement =
    document.querySelector("link[rel='icon']")!

  if (estPassEmploi(conseiller.structure)) {
    faviconLink.href = '/pass-emploi-favicon-notif.png'
  } else {
    faviconLink.href = '/cej-favicon-notif.png'
  }
}

function resetBrowserTab(backupTitle: string) {
  document.title = backupTitle

  const faviconLink: HTMLLinkElement =
    document.querySelector("link[rel='icon']")!
  faviconLink.href = '/cej-favicon.png'
}
