import { Message, MessagesOfADay } from 'interfaces'
import { JeuneChat } from 'interfaces/jeune'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MessagesService } from 'services/messages.service'
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
    (jeuneChatToUpdate: JeuneChat) => {
      messagesService.setReadByConseiller(jeuneChatToUpdate.chatId)
    },
    [messagesService]
  )

  const observerMessages = useCallback(
    (jeuneChatToObserve: JeuneChat) => {
      return messagesService.observeMessages(
        jeuneChatToObserve.chatId,
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
    (jeuneChatToObserve: JeuneChat) => {
      return messagesService.observeJeuneReadingDate(
        jeuneChatToObserve.chatId,
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
    <div className='h-full flex flex-col'>
      <div className='flex items-baseline'>
        <button className='ml-11 mr-8 border-none' onClick={onBack}>
          <ChevronLeftIcon
            role='img'
            focusable='false'
            aria-label='Retour sur ma messagerie'
          />
        </button>
        <h2 className='w-full text-center text-bleu_nuit h2-semi mb-8'>
          Discuter avec
          <br />
          {jeuneChat.firstName} {jeuneChat.lastName}
        </h2>
      </div>

      <ul className='p-4 flex-grow overflow-y-auto'>
        {messagesByDay.map(
          (messagesOfADay: MessagesOfADay, dailyIndex: number) => (
            <li key={messagesOfADay.date.getTime()} className='mb-5'>
              <div className={`text-md text-bleu text-center mb-3`}>
                <span>{todayOrDate(messagesOfADay.date)}</span>
              </div>

              <ul>
                {messagesOfADay.messages.map(
                  (message: Message, index: number) => (
                    <li key={message.id} className='mb-5'>
                      <p
                        className={`text-md break-words max-w-[90%] p-4 rounded-large w-max ${
                          message.sentBy === 'conseiller'
                            ? 'text-right text-blanc bg-bleu_nuit mt-0 mr-0 mb-1 ml-auto'
                            : 'text-left text-bleu_nuit bg-bleu_blanc mb-1'
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
        className='w-full bg-blanc p-3 flex'
      >
        <input
          type='text'
          value={newMessage}
          className='flex-grow px-4 py-3 bg-bleu_blanc mr-6 rounded-full border-0 text-md text-bleu_nuit border-none'
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder='Écrivez votre message ici...'
        />

        <button
          type='submit'
          disabled={!newMessage}
          className='bg-bleu_nuit w-12 h-12 border-none rounded-[50%]'
        >
          <SendIcon aria-hidden='true' focusable='false' className='m-auto' />
        </button>
      </form>
    </div>
  )
}
