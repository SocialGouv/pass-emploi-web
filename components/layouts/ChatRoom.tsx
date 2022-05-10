import Link from 'next/link'
import { useEffect, useState } from 'react'

import FbCheckIcon from '../../assets/icons/fb_check.svg'
import FbCheckFillIcon from '../../assets/icons/fb_check_fill.svg'
import MessageGroupeIcon from '../../assets/icons/forward_to_inbox.svg'
import EmptyMessagesImage from '../../assets/images/empty_message.svg'

import Conversation from 'components/layouts/Conversation'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { JeunesService } from 'services/jeunes.service'
import styles from 'styles/components/Layouts.module.css'
import linkStyle from 'styles/components/Link.module.css'
import useSession from 'utils/auth/useSession'
import { useCurrentJeune } from 'utils/chat/currentJeuneContext'
import { formatDayAndHourDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'

interface ChatRoomProps {
  jeunesChats: JeuneChat[]
}

export default function ChatRoom({ jeunesChats }: ChatRoomProps) {
  const { data: session } = useSession<true>({ required: true })
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const [currentJeune, setCurrentJeune] = useCurrentJeune()
  const [currentChat, setCurrentChat] = useState<JeuneChat | undefined>(
    undefined
  )
  const [conseillers, setConseillers] = useState<ConseillerHistorique[]>([])

  useEffect(() => {
    if (currentJeune?.id && session) {
      jeunesService
        .getConseillersDuJeune(currentJeune.id, session.accessToken)
        .then((conseillersJeunes) => setConseillers(conseillersJeunes))
    }
  }, [jeunesService, currentJeune?.id, session])

  useEffect(() => {
    if (currentJeune?.id) {
      setCurrentChat(
        jeunesChats.find((jeuneChat) => jeuneChat.id === currentJeune.id)
      )
    } else {
      setCurrentChat(undefined)
    }
  }, [jeunesChats, currentJeune?.id])

  return (
    <article className={styles.chatRoom}>
      {currentChat && (
        <Conversation
          onBack={() => setCurrentJeune(undefined)}
          jeuneChat={currentChat}
          conseillers={conseillers}
        />
      )}

      {!currentChat && (
        <>
          <h2 className={`text-m-medium text-primary text-center m-3`}>
            Messagerie
          </h2>
          <span className='border-b border-grey_500 mx-4 mb-6'></span>

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
                    <button
                      className='w-full p-3 flex flex-col text-left border-none bg-blanc rounded-[6px]'
                      onClick={() => setCurrentJeune(jeuneChat)}
                    >
                      {!jeuneChat.seenByConseiller &&
                        jeuneChat.lastMessageContent && (
                          <p className='flex items-center text-accent_1 text-sm-regular mb-2'>
                            <span className='text-[48px] mr-1'>·</span>
                            Nouveau message
                          </p>
                        )}
                      <span className='text-md-semi text-primary_darken mb-2 w-full flex justify-between'>
                        {jeuneChat.firstName} {jeuneChat.lastName}
                      </span>
                      <span className='text-sm text-grey_800 mb-[8px]'>
                        {' '}
                        {jeuneChat.lastMessageSentBy === 'conseiller'
                          ? 'Vous'
                          : jeuneChat.firstName}{' '}
                        : {jeuneChat.lastMessageContent}
                      </span>
                      <span className='text-xxs-italic text-content_color self-end flex'>
                        {jeuneChat.lastMessageContent && (
                          <span className='mr-[7px]'>
                            {formatDayAndHourDate(jeuneChat.lastMessageSentAt!)}{' '}
                          </span>
                        )}
                        {(jeuneChat.seenByConseiller &&
                          jeuneChat.lastMessageContent) ||
                        !jeuneChat.isActivated ? (
                          <FbCheckIcon focusable='false' aria-hidden='true' />
                        ) : (
                          <FbCheckFillIcon
                            focusable='false'
                            aria-hidden='true'
                          />
                        )}
                      </span>
                    </button>
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
