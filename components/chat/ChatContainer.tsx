import React, { useEffect, useRef, useState } from 'react'

import ChatRoom from 'components/chat/ChatRoom'
import ConversationBeneficiaire from 'components/chat/ConversationBeneficiaire'
import ListeListes from 'components/chat/ListeListes'
import RubriqueListes from 'components/chat/RubriqueListes'
import {
  BeneficiaireEtChat,
  ConseillerHistorique,
} from 'interfaces/beneficiaire'
import { Liste } from 'interfaces/liste'
import { getConseillersDuJeuneClientSide } from 'services/beneficiaires.service'
import { getListesClientSide } from 'services/listes.service'
import { useChats } from 'utils/chat/chatsContext'
import { useCurrentConversation } from 'utils/chat/currentConversationContext'
import { useListeSelectionnee } from 'utils/chat/listeSelectionneeContext'
import { useShowRubriqueListe } from 'utils/chat/showRubriqueListeContext'

type ChatContainerProps = {
  onShowMenu: () => void
  messagerieFullScreen?: boolean
}

export default function ChatContainer({
  onShowMenu,
  messagerieFullScreen,
}: ChatContainerProps) {
  const chatRoomRef = useRef<{
    focusAccesListes: () => void
    focusConversation: (id: string) => void
  }>(null)
  const listeListesDifffusion = useRef<{
    focusRetour: () => void
    focusListe: (id: string) => void
  }>(null)

  const chats = useChats()

  const [currentConversation, setCurrentConversation] = useCurrentConversation()
  const [conseillers, setConseillers] = useState<ConseillerHistorique[]>([])
  const conversationAFocus = useRef<string | undefined>(undefined)

  const [showRubriqueListes, setShowRubriqueListes] = useShowRubriqueListe()
  const [listes, setListes] = useState<Liste[]>()
  const [listeSelectionnee, setListeSelectionnee] = useListeSelectionnee()

  function afficherConversation(conversation: BeneficiaireEtChat | undefined) {
    if (conversation) conversationAFocus.current = conversation.id
    setCurrentConversation(conversation)
  }

  useEffect(() => {
    if (showRubriqueListes && !listes) getListesClientSide().then(setListes)
    if (showRubriqueListes === false) chatRoomRef.current?.focusAccesListes()
  }, [listes, showRubriqueListes])

  useEffect(() => {
    if (
      currentConversation &&
      !listeSelectionnee.liste &&
      !showRubriqueListes
    ) {
      getConseillersDuJeuneClientSide(currentConversation.id).then(
        (conseillersJeunes) => setConseillers(conseillersJeunes)
      )
    }
  }, [currentConversation, chats])

  useEffect(() => {
    if (!currentConversation && conversationAFocus.current) {
      chatRoomRef.current!.focusConversation(conversationAFocus.current)
      conversationAFocus.current = undefined
    }
  }, [currentConversation])

  useEffect(() => {
    if (!messagerieFullScreen) return
    if (showRubriqueListes && !listeSelectionnee.idAFocus)
      listeListesDifffusion.current!.focusRetour()
  }, [showRubriqueListes])

  useEffect(() => {
    if (!messagerieFullScreen || !showRubriqueListes) return
    if (!listeSelectionnee.liste && listeSelectionnee.idAFocus) {
      listeListesDifffusion.current!.focusListe(listeSelectionnee.idAFocus)
      setListeSelectionnee({})
    }
  }, [listeSelectionnee.liste])

  return (
    <>
      {messagerieFullScreen && (
        <>
          {showRubriqueListes && (
            <ListeListes
              ref={listeListesDifffusion}
              listes={listes}
              onAfficherListe={(liste) => setListeSelectionnee({ liste })}
              onBack={() => {
                setShowRubriqueListes(false)
                setListeSelectionnee({})
              }}
            />
          )}

          {!showRubriqueListes && (
            <ChatRoom
              ref={chatRoomRef}
              beneficiairesChats={chats}
              onOuvertureMenu={onShowMenu}
              onAccesListes={() => setShowRubriqueListes(true)}
              onAccesConversation={afficherConversation}
            />
          )}
        </>
      )}

      {!messagerieFullScreen && (
        <>
          {showRubriqueListes && (
            <RubriqueListes
              listes={listes}
              chats={chats}
              onBack={() => setShowRubriqueListes(false)}
            />
          )}

          {!showRubriqueListes && currentConversation && (
            <ConversationBeneficiaire
              onBack={() => afficherConversation(undefined)}
              beneficiaireChat={currentConversation}
              conseillers={conseillers}
            />
          )}

          {!showRubriqueListes && !currentConversation && (
            <ChatRoom
              ref={chatRoomRef}
              beneficiairesChats={chats}
              onOuvertureMenu={onShowMenu}
              onAccesListes={() => setShowRubriqueListes(true)}
              onAccesConversation={afficherConversation}
            />
          )}
        </>
      )}
    </>
  )
}
