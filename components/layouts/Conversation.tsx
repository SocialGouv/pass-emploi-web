import { Message, MessagesOfADay } from 'interfaces'
import { JeuneChat } from 'interfaces/jeune'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MessagesService } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import {
  dateIsToday,
  formatDayDate,
  formatHourMinuteDate,
  isDateOlder,
} from 'utils/date'
import { useDependance } from 'utils/injectionDependances'
import ChevronLeftIcon from '../../assets/icons/chevron_left.svg'
import SendIcon from '../../assets/icons/send.svg'

const todayOrDate = (date: Date) =>
  dateIsToday(date) ? "Aujourd'hui" : `Le ${formatDayDate(date)}`

type ConversationProps = {
  jeuneChat: JeuneChat
  onBack: () => void
}

export default function Conversation({ jeuneChat, onBack }: ConversationProps) {
  const { data: session } = useSession({ required: true })
  const messagesService = useDependance<MessagesService>('messagesService')

  const [newMessage, setNewMessage] = useState('')
  const [messagesByDay, setMessagesByDay] = useState<MessagesOfADay[]>([])
  const [lastSeenByJeune, setLastSeenByJeune] = useState<Date>(new Date())

  const dummySpace = useRef<HTMLLIElement>(null)

  const sendNouveauMessage = (event: any) => {
    event.preventDefault()

    messagesService.sendNouveauMessage(
      {
        id: session!.user.id,
        structure: session!.user.structure,
      },
      jeuneChat,
      newMessage,
      session!.accessToken
    )

    setNewMessage('')
  }

  const setReadByConseiller = useCallback(
    (jeuneChat: JeuneChat) => {
      messagesService.setReadByConseiller(jeuneChat.chatId)
    },
    [messagesService]
  )

  const observerMessages = useCallback(
    (jeuneChat: JeuneChat) => {
      return messagesService.observeMessages(
        jeuneChat.chatId,
        (messagesGroupesParJour: MessagesOfADay[]) => {
          setMessagesByDay(messagesGroupesParJour)

          if (dummySpace?.current) {
            dummySpace.current.scrollIntoView({ behavior: 'smooth' })
          }
        }
      )
    },
    [messagesService]
  )

  const observerLastJeuneReadingDate = useCallback(
    (jeuneChat: JeuneChat) => {
      return messagesService.observeJeuneReadingDate(
        jeuneChat.chatId,
        setLastSeenByJeune
      )
    },
    [messagesService]
  )

  useEffect(() => {
    const unsubscribe = observerMessages(jeuneChat)
    setReadByConseiller(jeuneChat)

    return () => unsubscribe()
  }, [jeuneChat, observerMessages, setReadByConseiller])

  useEffect(() => {
    const unsubscribe = observerLastJeuneReadingDate(jeuneChat)
    return () => unsubscribe()
  }, [jeuneChat, observerLastJeuneReadingDate])

  return (
    <div className={styles.conversationContainer}>
      <div className={styles.conversationTitleContainer}>
        <button onClick={onBack}>
          <ChevronLeftIcon
            role='img'
            focusable='false'
            aria-label='Retour sur ma messagerie'
          />
        </button>
        <h2 className='h2-semi'>Discuter avec {jeuneChat.firstName}</h2>
      </div>

      <ul className={styles.messages}>
        {messagesByDay.map(
          (messagesOfADay: MessagesOfADay, dailyIndex: number) => (
            <li key={messagesOfADay.date.getTime()}>
              <div className={`text-md text-bleu ${styles.day}`}>
                <span>{todayOrDate(messagesOfADay.date)}</span>
              </div>

              <ul>
                {messagesOfADay.messages.map(
                  (message: Message, index: number) => (
                    <li key={message.id}>
                      <p
                        className={`text-md ${
                          message.sentBy === 'conseiller'
                            ? styles.sentMessage
                            : styles.receivedMessage
                        }`}
                      >
                        {message.content}
                      </p>
                      <p
                        className={`text-xs text-bleu_gris ${
                          message.sentBy === 'conseiller'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {formatHourMinuteDate(message.creationDate)}
                        {message.sentBy === 'conseiller' && (
                          <span>
                            {isDateOlder(message.creationDate, lastSeenByJeune)
                              ? ' · Lu'
                              : ' · Envoyé'}
                          </span>
                        )}
                      </p>

                      {dailyIndex === messagesByDay.length - 1 &&
                        index === messagesOfADay.messages.length - 1 && (
                          <section aria-hidden='true' ref={dummySpace} />
                        )}
                    </li>
                  )
                )}
              </ul>
            </li>
          )
        )}
      </ul>

      <form
        data-testid='newMessageForm'
        onSubmit={sendNouveauMessage}
        className={styles.form}
      >
        <input
          type='text'
          value={newMessage}
          className='text-md text-bleu_nuit'
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder='Écrivez votre message ici...'
        />

        <button
          type='submit'
          disabled={!newMessage}
          className='bg-bleu_nuit w-[48px] p-[17px] rounded rounded-x_large'
        >
          <SendIcon aria-hidden='true' focusable='false' />
        </button>
      </form>
    </div>
  )
}
