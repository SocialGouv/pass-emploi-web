import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import MessageGroupeIcon from 'assets/icons/forward_to_inbox.svg'
import EmptyMessagesImage from 'assets/images/empty_state.svg'
import Conversation from 'components/Conversation'
import AlertDisplayer from 'components/layouts/AlertDisplayer'
import { ChatRoomTile } from 'components/messages/ChatRoomTile'
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

  return (
    <article className={styles.chatRoom}>
      {currentChat && (
        <Conversation
          onBack={() => setIdCurrentJeune(undefined)}
          jeuneChat={currentChat}
          conseillers={conseillers}
        />
      )}

      {!currentChat && (
        <>
          <h2 className={`text-m-medium text-primary text-left m-3`}>
            Messagerie
          </h2>
          <span className='border-b border-grey_500 mx-4 mb-6'></span>

          <div className='mx-3'>
            <AlertDisplayer hideOnLargeScreen={true} />
          </div>

          {!jeunesChats.length && (
            <div className='h-full overflow-y-auto bg-grey_100 flex flex-col justify-center items-center'>
              <EmptyMessagesImage focusable='false' aria-hidden='true' />
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
        </>
      )}
    </article>
  )
}
