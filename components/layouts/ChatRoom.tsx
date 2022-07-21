import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

import MessageGroupeIcon from 'assets/icons/forward_to_inbox.svg'
import EmptyStateImage from 'assets/images/empty_state.svg'
import Conversation from 'components/Conversation'
import AlertDisplayer from 'components/layouts/AlertDisplayer'
import Menu, { MenuItem } from 'components/Menu'
import { ChatRoomTile } from 'components/messages/ChatRoomTile'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import linkStyle from 'styles/components/Link.module.css'
import useSession from 'utils/auth/useSession'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import { useDependance } from 'utils/injectionDependances'

interface ChatRoomProps {
  jeunesChats: JeuneChat[]
}

export default function ChatRoom({ jeunesChats }: ChatRoomProps) {
  const { data: session } = useSession<true>({ required: true })
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const messagesService = useDependance<MessagesService>('messagesService')

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

  useEffect(() => {
    if (idCurrentJeune && session) {
      jeunesService
        .getConseillersDuJeune(idCurrentJeune, session.accessToken)
        .then((conseillersJeunes) => setConseillers(conseillersJeunes))
    }
  }, [jeunesService, idCurrentJeune, session])

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
          <Menu forceLabels={true} items={[MenuItem.Aide]} />
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
            <h2 className='text-m-medium text-primary text-center layout_s:text-left my-3 grow'>
              Messagerie
            </h2>
          </div>

          <div className='mx-3'>
            <AlertDisplayer hideOnLargeScreen={true} />
          </div>

          {!jeunesChats.length && (
            <div className='h-full overflow-y-auto bg-grey_100 flex flex-col justify-center items-center'>
              <EmptyStateImage
                focusable='false'
                aria-hidden='true'
                className='w-[360px] h-[200px]'
              />
              <p className='mt-4 text-md-semi w-2/3 text-center'>
                Vous devriez avoir des jeunes inscrits pour discuter avec eux
              </p>
            </div>
          )}

          {jeunesChats.length > 0 && (
            <>
              <ul className='h-full overflow-y-auto px-4 pb-24'>
                {jeunesChats.map((jeuneChat: JeuneChat) => (
                  <li key={`chat-${jeuneChat.id}`} className='mb-2'>
                    <ChatRoomTile
                      jeuneChat={jeuneChat}
                      id={`chat-${jeuneChat.id}`}
                      onClick={() => setIdCurrentJeune(jeuneChat.id)}
                      onToggleFlag={(flagged) =>
                        messagesService.toggleFlag(jeuneChat.chatId, flagged)
                      }
                    />
                  </li>
                ))}
              </ul>
              {/*FIXME : use <ButtonLink/> but causes problem with tailwind and style order*/}

              <Link href={'/mes-jeunes/envoi-message-groupe'}>
                <a
                  className={`absolute bottom-8 self-center ${linkStyle.linkButtonBlue}`}
                >
                  <MessageGroupeIcon
                    aria-hidden='true'
                    focusable='false'
                    className='mr-2'
                  />
                  Message multi-destinataires
                </a>
              </Link>
            </>
          )}
        </article>
      )}
    </>
  )
}
