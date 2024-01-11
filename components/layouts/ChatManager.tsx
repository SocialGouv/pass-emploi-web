import React, { useEffect, useRef, useState } from 'react'

import ChatContainer from 'components/chat/ChatContainer'
import ChatNav from 'components/chat/ChatNav'
import { compareJeuneChat, JeuneChat } from 'interfaces/jeune'
import { observeConseillerChats } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const CHEMIN_DU_SON = '/sounds/notification.mp3'

interface ChatManagerProps {
  displayChat: boolean
  setHasMessageNonLu: (value: boolean) => void
}

export default function ChatManager({
  displayChat,
  setHasMessageNonLu,
}: ChatManagerProps) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const chatCredentials = useChatCredentials()

  const [chats, setChats] = useState<JeuneChat[]>()
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const destructorRef = useRef<() => void>(() => undefined)

  const [showChatNav, setShowChatNav] = useState<boolean>(false)

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

            if (prevChat) {
              if (doitEmettreUnSon(prevChat, updatedChat)) {
                audio?.play()
              }
            }
          })
        }

        return [...updatedChats].sort(compareJeuneChat)
      })
      setHasMessageNonLu(hasMessageNonLu(updatedChats))
    }

    function doitEmettreUnSon(previousChat: JeuneChat, updatedChat: JeuneChat) {
      return (
        conseiller.notificationsSonores &&
        aUnNouveauMessage(previousChat, updatedChat)
      )
    }
  }, [portefeuille, chatCredentials, audio, conseiller.notificationsSonores])

  if (!displayChat) return null

  return (
    <>
      <aside className={styles.chatRoom}>
        <ChatContainer
          jeunesChats={chats}
          menuState={[showChatNav, setShowChatNav]}
        />
      </aside>

      {showChatNav && <ChatNav menuState={[showChatNav, setShowChatNav]} />}
    </>
  )
}
