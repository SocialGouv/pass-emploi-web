import Conversation from 'components/layouts/Conversation'
import { compareJeuneChat, Jeune, JeuneChat } from 'interfaces/jeune'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import linkStyle from 'styles/components/Link.module.css'
import { formatDayAndHourDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'
import FbCheckIcon from '../../assets/icons/fb_check.svg'
import FbCheckFillIcon from '../../assets/icons/fb_check_fill.svg'
import MessageGroupeIcon from '../../assets/icons/forward_to_inbox.svg'
import EmptyMessagesImage from '../../assets/images/empty_message.svg'

const currentJeunesChat: JeuneChat[] = [] // FIXME had to use extra variable since jeunesChats is always empty in useEffect

export default function ChatRoom() {
  const { data: session } = useSession({ required: true })
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const messagesService = useDependance<MessagesService>('messagesService')

  const [jeunesChats, setJeunesChats] = useState<JeuneChat[]>([])
  const [selectedChat, setSelectedChat] = useState<JeuneChat | undefined>(
    undefined
  )
  const destructorRef = useRef<() => void>(() => {})

  const isInConversation = () => Boolean(selectedChat !== undefined)

  const observeJeuneChats = useCallback(
    (idConseiller: string, jeunesToObserve: Jeune[]): (() => void) => {
      function updateChat(newJeuneChat: JeuneChat): void {
        const idxOfJeune = currentJeunesChat.findIndex(
          (j) => j.chatId === newJeuneChat.chatId
        )

        if (idxOfJeune !== -1) {
          currentJeunesChat[idxOfJeune] = newJeuneChat
        } else {
          currentJeunesChat.push(newJeuneChat)
        }
        currentJeunesChat.sort(compareJeuneChat)

        setJeunesChats([...currentJeunesChat])
      }

      const unsubscribes = jeunesToObserve.map((jeune: Jeune) =>
        messagesService.observeJeuneChat(idConseiller, jeune, updateChat)
      )
      return () => unsubscribes.forEach((unsubscribe) => unsubscribe())
    },
    [messagesService]
  )

  useEffect(() => {
    if (session) {
      messagesService
        .signIn(session.firebaseToken)
        .then(() =>
          jeunesService.getJeunesDuConseiller(
            session.user.id,
            session.accessToken
          )
        )
        .then((jeunes: Jeune[]) => observeJeuneChats(session.user.id, jeunes))
        .then((destructor) => (destructorRef.current = destructor))
    }
    return destructorRef.current
  }, [session, observeJeuneChats, messagesService, jeunesService])
  return (
    <article className={styles.chatRoom}>
      {isInConversation() && (
        <Conversation
          onBack={() => setSelectedChat(undefined)}
          jeuneChat={selectedChat!}
        />
      )}

      {!isInConversation() && (
        <>
          <h2 className={`h2-semi text-bleu_nuit ml-9 mb-6`}>Ma messagerie</h2>
          {!jeunesChats.length && (
            <div className='h-full overflow-y-auto bg-bleu_blanc flex flex-col justify-center items-center'>
              <EmptyMessagesImage focusable='false' aria-hidden='true' />
              <p className='mt-4 text-md-semi text-bleu_nuit w-2/3 text-center'>
                Vous devriez avoir des jeunes inscrits pour discuter avec eux
              </p>
            </div>
          )}

          {jeunesChats.length > 0 && (
            <>
              <ul className='h-full overflow-y-auto bg-bleu_blanc pb-24'>
                {jeunesChats.map(
                  (jeuneChat: JeuneChat) =>
                    jeuneChat.chatId && (
                      <li key={`chat-${jeuneChat.id}`} className='mb-[2px]'>
                        <button
                          className='w-full pt-4 pr-3 pb-2 pl-9 flex flex-col text-left border-none bg-blanc'
                          onClick={() => setSelectedChat(jeuneChat)}
                        >
                          <span className='text-lg-semi text-bleu_nuit mb-2 w-full flex justify-between'>
                            {jeuneChat.firstName} {jeuneChat.lastName}
                            {!jeuneChat.seenByConseiller &&
                              jeuneChat.lastMessageContent && (
                                <span className='text-violet text-xs border px-[7px] py-[5px] float-right rounded-x_small'>
                                  Nouveau message
                                </span>
                              )}
                          </span>
                          <span className='text-sm text-bleu_gris mb-[8px]'>
                            {' '}
                            {jeuneChat.lastMessageSentBy === 'conseiller'
                              ? 'Vous'
                              : jeuneChat.firstName}{' '}
                            : {jeuneChat.lastMessageContent}
                          </span>
                          <span className='text-xxs-italic text-bleu_nuit self-end flex'>
                            {jeuneChat.lastMessageContent && (
                              <span className='mr-[7px]'>
                                {formatDayAndHourDate(
                                  jeuneChat.lastMessageSentAt!
                                )}{' '}
                              </span>
                            )}
                            {(jeuneChat.seenByConseiller &&
                              jeuneChat.lastMessageContent) ||
                            !jeuneChat.isActivated ? (
                              <FbCheckIcon
                                focusable='false'
                                aria-hidden='true'
                              />
                            ) : (
                              <FbCheckFillIcon
                                focusable='false'
                                aria-hidden='true'
                              />
                            )}
                          </span>
                        </button>
                      </li>
                    )
                )}
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
