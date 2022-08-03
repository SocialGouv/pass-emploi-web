import React, { useEffect, useRef, useState } from 'react'

import Conversation from 'components/chat/Conversation'
import ListeConversations from 'components/chat/ListeConversations'
import AlertDisplayer from 'components/layouts/AlertDisplayer'
import Menu, { MenuItem } from 'components/Menu'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import { trackEvent } from 'utils/analytics/matomo'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'

interface ChatRoomProps {
  jeunesChats: JeuneChat[]
}

export default function ChatRoom({ jeunesChats }: ChatRoomProps) {
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const messagesService = useDependance<MessagesService>('messagesService')

  const [conseiller] = useConseiller()
  const [idCurrentJeune, setIdCurrentJeune] = useCurrentJeune()
  const [currentChat, setCurrentChat] = useState<JeuneChat | undefined>(
    undefined
  )
  const [conseillers, setConseillers] = useState<ConseillerHistorique[]>([])

  const [showMenu, setShowMenu] = useState<boolean>(false)
  const closeMenuRef = useRef<HTMLButtonElement>(null)

  function fermerMenu(): void {
    setShowMenu(false)
  }

  function ouvrirMenu(): void {
    setShowMenu(true)
  }

  function toggleFlag(idChat: string, flagged: boolean): void {
    messagesService.toggleFlag(idChat, flagged)
    trackEvent({
      structure: conseiller!.structure,
      categorie: 'Conversation suivie',
      action: 'ChatRoom',
      nom: flagged.toString(),
    })
  }

  useEffect(() => {
    if (idCurrentJeune) {
      jeunesService
        .getConseillersDuJeuneClientSide(idCurrentJeune)
        .then((conseillersJeunes) => setConseillers(conseillersJeunes))
    }
  }, [jeunesService, idCurrentJeune])

  useEffect(() => {
    if (idCurrentJeune) {
      setCurrentChat(
        jeunesChats.find((jeuneChat) => jeuneChat.id === idCurrentJeune)
      )
    } else {
      setCurrentChat(undefined)
    }
  }, [jeunesChats, idCurrentJeune])

  useEffect(() => {
    if (showMenu) {
      closeMenuRef.current!.focus()
    }
  }, [showMenu])

  return (
    <>
      {currentChat && (
        <article className={styles.chatRoom}>
          <Conversation
            onBack={() => setIdCurrentJeune(undefined)}
            jeuneChat={currentChat}
            conseillers={conseillers}
          />
        </article>
      )}

      {!currentChat && showMenu && (
        <div
          id='menu-mobile'
          className='w-[50vw] flex flex-col bg-primary z-10 layout_s:hidden'
        >
          <button
            ref={closeMenuRef}
            type='button'
            aria-controls='menu-mobile'
            onClick={fermerMenu}
            aria-label='Fermer menu'
            className='m-7 w-fit'
          >
            <IconComponent
              name={IconName.Close}
              className='w-10 h-10 fill-blanc'
              aria-hidden={true}
              focusable={false}
            />
          </button>
          <Menu showLabelsOnSmallScreen={true} items={[MenuItem.Aide]} />
        </div>
      )}

      {!currentChat && (
        <article className={styles.chatRoom}>
          <div className='relative bg-blanc shadow-s mb-6 layout_s:bg-grey_100 layout_s:shadow-none layout_s:mx-4 layout_s:border-b layout_s:border-grey_500'>
            <button
              type='button'
              onClick={ouvrirMenu}
              aria-label='Ouvrir menu'
              aria-controls='menu-mobile'
              className='absolute left-2 top-[calc(50%-1.25rem)]'
            >
              <IconComponent
                name={IconName.Menu}
                className='w-10 h-10 fill-primary layout_s:hidden'
                aria-hidden={true}
                focusable={false}
              />
            </button>
            <h2 className='text-m-bold text-primary text-center layout_s:text-left my-3 grow'>
              Messagerie
            </h2>
          </div>

          <div className='mx-3'>
            <AlertDisplayer hideOnLargeScreen={true} />
          </div>

          <ListeConversations
            conversations={jeunesChats}
            onToggleFlag={toggleFlag}
            onSelectConversation={(idChat) => setIdCurrentJeune(idChat)}
          />
        </article>
      )}
    </>
  )
}
