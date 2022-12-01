import React, { useEffect, useRef, useState } from 'react'

import Conversation from 'components/chat/Conversation'
import ListeConversations from 'components/chat/ListeConversations'
import { RechercheJeune } from 'components/jeune/RechercheJeune'
import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import NavLinks, { NavItem } from 'components/NavLinks'
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
  jeunesChats: JeuneChat[] | undefined
}

export default function ChatRoom({ jeunesChats }: ChatRoomProps) {
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const messagesService = useDependance<MessagesService>('messagesService')

  const [conseiller] = useConseiller()
  const [idCurrentJeune, setIdCurrentJeune] = useCurrentJeune()
  const [chatsFiltres, setChatsFiltres] = useState<JeuneChat[]>()
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

  function filtrerConversations(saisieUtilisateur: string) {
    const querySplit = saisieUtilisateur.toLowerCase().split(/-|\s/)
    const chatsFiltresResult = (jeunesChats ?? []).filter((jeune) => {
      const jeuneLastName = jeune.nom.replace(/’/i, "'").toLocaleLowerCase()
      for (const item of querySplit) {
        if (jeuneLastName.includes(item)) {
          return true
        }
      }
    })

    setChatsFiltres(chatsFiltresResult)
  }

  useEffect(() => {
    if (idCurrentJeune) {
      jeunesService
        .getConseillersDuJeuneClientSide(idCurrentJeune)
        .then((conseillersJeunes) => setConseillers(conseillersJeunes))
    }
  }, [jeunesService, idCurrentJeune])

  useEffect(() => {
    if (idCurrentJeune && jeunesChats) {
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

  useEffect(() => {
    setChatsFiltres(jeunesChats)
  }, [jeunesChats])

  return (
    <>
      {currentChat && (
        <aside className={styles.chatRoom}>
          <Conversation
            onBack={() => setIdCurrentJeune(undefined)}
            jeuneChat={currentChat}
            conseillers={conseillers}
          />
        </aside>
      )}

      {!currentChat && showMenu && (
        <nav
          role='navigation'
          id='menu-mobile'
          className='w-[100vw] flex flex-col bg-primary px-6 py-3 z-10 layout_s:hidden'
        >
          <button
            ref={closeMenuRef}
            type='button'
            aria-controls='menu-mobile'
            onClick={fermerMenu}
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

      {!currentChat && (
        <aside className={styles.chatRoom}>
          <div className='relative bg-blanc shadow-s mb-6 layout_s:bg-grey_100 layout_s:shadow-none layout_s:mx-4 layout_s:border-b layout_s:border-grey_500'>
            <nav
              role='navigation'
              aria-label='Menu principal'
              className={`layout_s:hidden ${showMenu ? 'hidden' : ''}`}
            >
              <button
                type='button'
                onClick={ouvrirMenu}
                aria-controls='menu-mobile'
                aria-expanded={showMenu}
                className='absolute left-4 top-[calc(50%-1.25rem)]'
              >
                <IconComponent
                  name={IconName.Menu}
                  className='w-10 h-10 fill-primary layout_s:hidden'
                  aria-hidden={true}
                  focusable={false}
                  title='Ouvrir le menu principal'
                />
              </button>
            </nav>

            <h2 className='text-m-bold text-primary text-center m-6 grow layout_s:text-left layout_s:p-0 layout_base:my-3'>
              Messagerie
            </h2>
          </div>

          <div className='mx-3'>
            <AlerteDisplayer hideOnLargeScreen={true} />
          </div>

          <div
            className='flex justify-center my-8 layout_s:hidden'
            data-testid='form-chat'
          >
            <RechercheJeune onSearchFilterBy={filtrerConversations} />
          </div>

          <ListeConversations
            conversations={chatsFiltres}
            onToggleFlag={toggleFlag}
            onSelectConversation={(idChat) => setIdCurrentJeune(idChat)}
          />
        </aside>
      )}
    </>
  )
}
