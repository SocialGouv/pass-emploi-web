import React, { useEffect, useRef, useState } from 'react'

import ChatRoom from 'components/chat/ChatRoom'
import ConversationBeneficiaire from 'components/chat/ConversationBeneficiaire'
import ListeListesDeDiffusion from 'components/chat/ListeListesDeDiffusion'
import RubriqueListesDeDiffusion from 'components/chat/RubriqueListesDeDiffusion'
import {
  BeneficiaireEtChat,
  ConseillerHistorique,
} from 'interfaces/beneficiaire'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { getConseillersDuJeuneClientSide } from 'services/beneficiaires.service'
import { getListesDeDiffusionClientSide } from 'services/listes-de-diffusion.service'
import { useChats } from 'utils/chat/chatsContext'
import { useCurrentConversation } from 'utils/chat/currentConversationContext'
import { useListeDeDiffusionSelectionnee } from 'utils/chat/listeDeDiffusionSelectionneeContext'
import { useShowRubriqueListeDeDiffusion } from 'utils/chat/showRubriqueListeDeDiffusionContext'

type ChatContainerProps = {
  onShowMenu: () => void
  messagerieFullScreen?: boolean
}

export default function ChatContainer({
  onShowMenu,
  messagerieFullScreen,
}: ChatContainerProps) {
  const chatRoomRef = useRef<{
    focusAccesListesDiffusion: () => void
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

  const [showRubriqueListesDeDiffusion, setShowRubriqueListesDeDiffusion] =
    useShowRubriqueListeDeDiffusion()
  const [listesDeDiffusion, setListesDeDiffusion] =
    useState<ListeDeDiffusion[]>()
  const [listeSelectionnee, setListeSelectionnee] =
    useListeDeDiffusionSelectionnee()

  function afficherConversation(conversation: BeneficiaireEtChat | undefined) {
    if (conversation) conversationAFocus.current = conversation.id
    setCurrentConversation(
      conversation && { conversation, shouldFocusOnRender: true }
    )
  }

  useEffect(() => {
    if (showRubriqueListesDeDiffusion && !listesDeDiffusion)
      getListesDeDiffusionClientSide().then(setListesDeDiffusion)
    if (showRubriqueListesDeDiffusion === false)
      chatRoomRef.current?.focusAccesListesDiffusion()
  }, [listesDeDiffusion, showRubriqueListesDeDiffusion])

  useEffect(() => {
    if (
      currentConversation &&
      !listeSelectionnee.liste &&
      !showRubriqueListesDeDiffusion
    ) {
      getConseillersDuJeuneClientSide(currentConversation.conversation.id).then(
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
    if (showRubriqueListesDeDiffusion && !listeSelectionnee.idAFocus)
      listeListesDifffusion.current!.focusRetour()
  }, [showRubriqueListesDeDiffusion])

  useEffect(() => {
    if (!messagerieFullScreen || !showRubriqueListesDeDiffusion) return
    if (!listeSelectionnee.liste && listeSelectionnee.idAFocus) {
      listeListesDifffusion.current!.focusListe(listeSelectionnee.idAFocus)
      setListeSelectionnee({})
    }
  }, [listeSelectionnee.liste])

  return (
    <>
      {messagerieFullScreen && (
        <>
          {showRubriqueListesDeDiffusion && (
            <ListeListesDeDiffusion
              ref={listeListesDifffusion}
              listesDeDiffusion={listesDeDiffusion}
              onAfficherListe={(liste) => setListeSelectionnee({ liste })}
              onBack={() => {
                setShowRubriqueListesDeDiffusion(false)
                setListeSelectionnee({})
              }}
            />
          )}

          {!showRubriqueListesDeDiffusion && (
            <ChatRoom
              ref={chatRoomRef}
              beneficiairesChats={chats}
              onOuvertureMenu={onShowMenu}
              onAccesListesDiffusion={() =>
                setShowRubriqueListesDeDiffusion(true)
              }
              onAccesConversation={afficherConversation}
            />
          )}
        </>
      )}

      {!messagerieFullScreen && (
        <>
          {showRubriqueListesDeDiffusion && (
            <RubriqueListesDeDiffusion
              listesDeDiffusion={listesDeDiffusion}
              chats={chats}
              onBack={() => setShowRubriqueListesDeDiffusion(false)}
            />
          )}

          {!showRubriqueListesDeDiffusion && currentConversation && (
            <ConversationBeneficiaire
              onBack={() => afficherConversation(undefined)}
              beneficiaireChat={currentConversation.conversation}
              shouldFocusOnFirstRender={currentConversation.shouldFocusOnRender}
              conseillers={conseillers}
            />
          )}

          {!showRubriqueListesDeDiffusion && !currentConversation && (
            <ChatRoom
              ref={chatRoomRef}
              beneficiairesChats={chats}
              onOuvertureMenu={onShowMenu}
              onAccesListesDiffusion={() =>
                setShowRubriqueListesDeDiffusion(true)
              }
              onAccesConversation={afficherConversation}
            />
          )}
        </>
      )}
    </>
  )
}
