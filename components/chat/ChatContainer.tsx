'use client'

import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'

import ChatRoom from 'components/chat/ChatRoom'
import ConversationBeneficiaire from 'components/chat/ConversationBeneficiaire'
import ListeListesDeDiffusion from 'components/chat/ListeListesDeDiffusion'
import RubriqueListesDeDiffusion from 'components/chat/RubriqueListesDeDiffusion'
import HeaderListeListesDeDiffusion from 'components/messagerie/HeaderListeListesDeDiffusion'
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
  menuState: [boolean, Dispatch<SetStateAction<boolean>>]
  messagerieFullScreen?: boolean
}

export default function ChatContainer({
  menuState: [showMenu, setShowMenu],
  messagerieFullScreen,
}: ChatContainerProps) {
  const conversationIdRef = useRef<string | undefined>(undefined)

  const chats = useChats()
  const [currentConversation, setCurrentConversation] = useCurrentConversation()

  const [conseillers, setConseillers] = useState<ConseillerHistorique[]>([])
  const [listeSelectionnee, setListeSelectionnee] =
    useListeDeDiffusionSelectionnee()

  const [showRubriqueListesDeDiffusion, setShowRubriqueListesDeDiffusion] =
    useShowRubriqueListeDeDiffusion()
  const [listesDeDiffusion, setListesDeDiffusion] =
    useState<ListeDeDiffusion[]>()

  function afficherConversation(conversation: BeneficiaireEtChat | undefined) {
    if (conversation) conversationIdRef.current = conversation.id
    setCurrentConversation(
      conversation && { conversation, shouldFocusOnRender: true }
    )
  }

  useEffect(() => {
    if (showRubriqueListesDeDiffusion && !listesDeDiffusion) {
      getListesDeDiffusionClientSide().then(setListesDeDiffusion)
    }
  }, [listesDeDiffusion, showRubriqueListesDeDiffusion])

  useEffect(() => {
    if (
      currentConversation &&
      !listeSelectionnee &&
      !showRubriqueListesDeDiffusion
    ) {
      getConseillersDuJeuneClientSide(currentConversation.conversation.id).then(
        (conseillersJeunes) => setConseillers(conseillersJeunes)
      )
    }
  }, [currentConversation, chats])

  return (
    <>
      {messagerieFullScreen && (
        <>
          {showRubriqueListesDeDiffusion && (
            <>
              <HeaderListeListesDeDiffusion
                ref={!listeSelectionnee ? (e) => e?.focusRetour() : undefined}
                onBack={() => {
                  setShowRubriqueListesDeDiffusion(false)
                  setListeSelectionnee(undefined)
                }}
              />
              <ListeListesDeDiffusion
                listesDeDiffusion={listesDeDiffusion}
                onAfficherListe={setListeSelectionnee}
                messagerieFullScreen={true}
              />
            </>
          )}

          {!showRubriqueListesDeDiffusion && (
            <ChatRoom
              shouldFocusAccesListesDiffusion={
                showRubriqueListesDeDiffusion === false
              }
              beneficiairesChats={chats}
              showMenu={showMenu}
              onOuvertureMenu={() => setShowMenu(true)}
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
          {currentConversation && (
            <ConversationBeneficiaire
              onBack={() => afficherConversation(undefined)}
              beneficiaireChat={currentConversation.conversation}
              shouldFocusOnFirstRender={currentConversation.shouldFocusOnRender}
              conseillers={conseillers}
            />
          )}

          {showRubriqueListesDeDiffusion && (
            <RubriqueListesDeDiffusion
              listesDeDiffusion={listesDeDiffusion}
              chats={chats}
              onBack={() => setShowRubriqueListesDeDiffusion(false)}
            />
          )}

          {!currentConversation && !showRubriqueListesDeDiffusion && (
            <ChatRoom
              shouldFocusAccesListesDiffusion={
                showRubriqueListesDeDiffusion === false
              }
              beneficiairesChats={chats}
              showMenu={showMenu}
              onOuvertureMenu={() => setShowMenu(true)}
              onAccesListesDiffusion={() =>
                setShowRubriqueListesDeDiffusion(true)
              }
              onAccesConversation={afficherConversation}
              idConversationToFocus={conversationIdRef.current}
            />
          )}
        </>
      )}
    </>
  )
}
