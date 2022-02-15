import Conversation from 'components/layouts/Conversation'
import { Jeune, JeuneChat, compareJeuneChat } from 'interfaces/jeune'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import { formatDayAndHourDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'
import EmptyMessagesImage from '../../assets/images/empty_message.svg'
import FbCheckIcon from '../../assets/icons/fb_check.svg'
import FbCheckFillIcon from '../../assets/icons/fb_check_fill.svg'

let currentJeunesChat: JeuneChat[] = [] // had to use extra variable since jeunesChats is always empty in useEffect

type ChatRoomProps = {}

export default function ChatRoom({}: ChatRoomProps) {
  const { data: session } = useSession({ required: true })
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const messagesService = useDependance<MessagesService>('messagesService')

  const [jeunesChats, setJeunesChats] = useState<JeuneChat[]>([])
  const [jeunes, setJeunes] = useState<Jeune[]>([])
  const [selectedChat, setSelectedChat] = useState<JeuneChat | undefined>(
    undefined
  )

  const isInConversation = () => Boolean(selectedChat !== undefined)

  const signInChat = useCallback(
    async (chatToken) => {
      await messagesService.signIn(chatToken)
    },
    [messagesService]
  )

  const observeJeuneChats = useCallback(
    (idConseiller: string, jeunesToObserve: Jeune[]) => {
      const unsubscribes = jeunesToObserve.map((jeune: Jeune) =>
        messagesService.observeJeuneChat(idConseiller, jeune, updateJeunesChat)
      )
      return () => unsubscribes.forEach((unsubscribe) => unsubscribe())
    },
    [messagesService]
  )

  useEffect(() => {
    if (!session) {
      return
    }

    jeunesService
      .getJeunesDuConseiller(session!.user.id, session!.accessToken)
      .then((data) => {
        setJeunes(data)
        currentJeunesChat = []
      })
  }, [session, jeunesService])

  useEffect(() => {
    if (session?.firebaseToken) {
      signInChat(session.firebaseToken).then(() => {
        observeJeuneChats(session!.user.id, jeunes)
      })
    }
  }, [session, jeunes, signInChat, observeJeuneChats])

  function updateJeunesChat(newJeuneChat: JeuneChat): void {
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
          <h2 className={`h2-semi text-bleu_nuit ${styles.chatroomTitle}`}>
            Ma messagerie
          </h2>
          {!jeunesChats?.length && (
            <div className={`${styles.conversations} relative`}>
              <div className='absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4'>
                <EmptyMessagesImage
                  className='mb-[16px]'
                  focusable='false'
                  aria-hidden='true'
                />
                <p className='text-md-semi text-bleu_nuit text-center'>
                  Vous devriez avoir des jeunes inscrits pour discuter avec eux
                </p>
              </div>
            </div>
          )}

          <ul className={styles.conversations}>
            {jeunesChats.map(
              (jeuneChat: JeuneChat) =>
                jeuneChat.chatId && (
                  <li key={`chat-${jeuneChat.id}`}>
                    <button
                      className='border-none'
                      onClick={() => setSelectedChat(jeuneChat)}
                    >
                      <span className='text-lg-semi text-bleu_nuit w-full mb-[7px]'>
                        {jeuneChat.firstName} {jeuneChat.lastName}
                        {!jeuneChat.seenByConseiller && (
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
                            {formatDayAndHourDate(jeuneChat.lastMessageSentAt!)}{' '}
                          </span>
                        )}
                        {jeuneChat.seenByConseiller ? (
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
                )
            )}
          </ul>
        </>
      )}
    </article>
  )
}
