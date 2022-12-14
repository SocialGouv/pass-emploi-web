import React, { useEffect, useRef, useState } from 'react'

import ChatRoom from 'components/chat/ChatRoom'
import Conversation from 'components/chat/Conversation'
import RubriqueListesDeDiffusion from 'components/chat/RubriqueListesDeDiffusion'
import NavLinks, { NavItem } from 'components/NavLinks'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { JeunesService } from 'services/jeunes.service'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import styles from 'styles/components/Layouts.module.css'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import { useDependance } from 'utils/injectionDependances'

interface ChatContainerProps {
  jeunesChats: JeuneChat[] | undefined
}

export default function ChatContainer({ jeunesChats }: ChatContainerProps) {
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const listesDeDiffusionService = useDependance<ListesDeDiffusionService>(
    'listesDeDiffusionService'
  )

  const [idCurrentJeune, setIdCurrentJeune] = useCurrentJeune()
  const [currentChat, setCurrentChat] = useState<JeuneChat | undefined>(
    undefined
  )
  const [conseillers, setConseillers] = useState<ConseillerHistorique[]>([])

  const [showRubriqueListesDeDiffusion, setShowRubriqueListesDeDiffusion] =
    useState<boolean>(false)
  const [listesDeDiffusion, setListesDeDiffusion] =
    useState<ListeDeDiffusion[]>()

  const [showMenu, setShowMenu] = useState<boolean>(false)
  const closeMenuRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (showRubriqueListesDeDiffusion && !listesDeDiffusion) {
      listesDeDiffusionService
        .getListesDeDiffusionClientSide()
        .then(setListesDeDiffusion)
    }
  }, [
    listesDeDiffusionService,
    listesDeDiffusion,
    showRubriqueListesDeDiffusion,
  ])

  useEffect(() => {
    if (idCurrentJeune) {
      jeunesService
        .getConseillersDuJeuneClientSide(idCurrentJeune)
        .then((conseillersJeunes) => setConseillers(conseillersJeunes))

      if (jeunesChats) {
        setCurrentChat(
          jeunesChats.find((jeuneChat) => jeuneChat.id === idCurrentJeune)
        )
      }
    } else {
      setCurrentChat(undefined)
    }
  }, [jeunesService, idCurrentJeune, jeunesChats])

  useEffect(() => {
    if (showMenu) {
      closeMenuRef.current!.focus()
    }
  }, [showMenu])

  return (
    <>
      <aside className={styles.chatRoom}>
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
      </aside>

      {showMenu && (
        <nav
          role='navigation'
          id='menu-mobile'
          className='w-[100vw] flex flex-col bg-primary px-6 py-3 z-10 layout_s:hidden'
        >
          <button
            ref={closeMenuRef}
            type='button'
            aria-controls='menu-mobile'
            onClick={() => setShowMenu(false)}
            aria-label='Fermer le menu principal'
            aria-expanded={true}
            className='w-fit p-1 -ml-4 mb-6 hover:bg-primary_darken hover:rounded-[50%]'
          >
            <IconComponent
              name={IconName.Close}
              className='w-10 h-10 fill-blanc'
              aria-hidden={true}
              focusable={false}
              title='Fermer le menu principal'
            />
          </button>
          <div className='grow flex flex-col justify-between'>
            <NavLinks
              showLabelsOnSmallScreen={true}
              items={[NavItem.Messagerie, NavItem.Raccourci, NavItem.Aide]}
            />
          </div>
        </nav>
      )}
    </>
  )
}
