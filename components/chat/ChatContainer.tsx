'use client'

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

import ChatRoom from 'components/chat/ChatRoom'
import Conversation from 'components/chat/Conversation'
import ListeListesDeDiffusion from 'components/chat/ListeListesDeDiffusion'
import RubriqueListesDeDiffusion from 'components/chat/RubriqueListesDeDiffusion'
import HeaderListeListesDeDiffusion from 'components/messagerie/HeaderListeListesDeDiffusion'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { getConseillersDuJeuneClientSide } from 'services/jeunes.service'
import { getListesDeDiffusionClientSide } from 'services/listes-de-diffusion.service'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import { useListeDeDiffusionSelectionnee } from 'utils/chat/listeDeDiffusionSelectionneeContext'
import { useShowRubriqueListeDeDiffusion } from 'utils/chat/showRubriqueListeDeDiffusionContext'

type ChatContainerProps = {
  jeunesChats: JeuneChat[] | undefined
  menuState: [boolean, Dispatch<SetStateAction<boolean>>]
  messagerieFullScreen?: boolean
}

export default function ChatContainer({
  jeunesChats,
  menuState: [showMenu, setShowMenu],
  messagerieFullScreen,
}: ChatContainerProps) {
  const [idCurrentJeune, setIdCurrentJeune] = useCurrentJeune()
  const [currentChat, setCurrentChat] = useState<JeuneChat | undefined>(
    undefined
  )
  const [conseillers, setConseillers] = useState<ConseillerHistorique[]>([])
  const [listeSelectionnee, setListeSelectionnee] =
    useListeDeDiffusionSelectionnee()

  const [showRubriqueListesDeDiffusion, setShowRubriqueListesDeDiffusion] =
    useShowRubriqueListeDeDiffusion()
  const [listesDeDiffusion, setListesDeDiffusion] =
    useState<ListeDeDiffusion[]>()

  useEffect(() => {
    if (showRubriqueListesDeDiffusion && !listesDeDiffusion) {
      getListesDeDiffusionClientSide().then(setListesDeDiffusion)
    }
  }, [listesDeDiffusion, showRubriqueListesDeDiffusion])

  useEffect(() => {
    if (idCurrentJeune) {
      getConseillersDuJeuneClientSide(idCurrentJeune).then(
        (conseillersJeunes) => setConseillers(conseillersJeunes)
      )

      if (jeunesChats) {
        if (
          !listeSelectionnee &&
          !showRubriqueListesDeDiffusion &&
          !currentChat
        )
          setCurrentChat(
            jeunesChats.find((jeuneChat) => jeuneChat.id === idCurrentJeune)
          )
      }
    } else {
      setCurrentChat(undefined)
    }
  }, [idCurrentJeune, jeunesChats])

  return (
    <>
      {messagerieFullScreen && (
        <>
          {showRubriqueListesDeDiffusion && (
            <>
              <HeaderListeListesDeDiffusion
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
              jeunesChats={jeunesChats}
              showMenu={showMenu}
              onOuvertureMenu={() => setShowMenu(true)}
              onAccesListesDiffusion={() =>
                setShowRubriqueListesDeDiffusion(true)
              }
              onAccesConversation={setIdCurrentJeune}
            />
          )}
        </>
      )}

      {!messagerieFullScreen && (
        <>
          {currentChat && (
            <Conversation
              onBack={() => setIdCurrentJeune(undefined)}
              jeuneChat={currentChat}
              conseillers={conseillers}
            />
          )}

          {showRubriqueListesDeDiffusion && (
            <RubriqueListesDeDiffusion
              listesDeDiffusion={listesDeDiffusion}
              chats={jeunesChats}
              onBack={() => setShowRubriqueListesDeDiffusion(false)}
            />
          )}

          {!currentChat && !showRubriqueListesDeDiffusion && (
            <ChatRoom
              jeunesChats={jeunesChats}
              showMenu={showMenu}
              onOuvertureMenu={() => setShowMenu(true)}
              onAccesListesDiffusion={() =>
                setShowRubriqueListesDeDiffusion(true)
              }
              onAccesConversation={setIdCurrentJeune}
            />
          )}
        </>
      )}
    </>
  )
}
