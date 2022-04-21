import { Message, MessagesOfADay } from 'interfaces'
import { ConseillerHistorique, JeuneChat } from 'interfaces/jeune'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MessagesService } from 'services/messages.service'
import useSession from 'utils/auth/useSession'
import {
  dateIsToday,
  formatDayDate,
  formatHourMinuteDate,
  isDateOlder,
} from 'utils/date'
import { useDependance } from 'utils/injectionDependances'
import ChevronLeftIcon from '../../assets/icons/chevron_left.svg'
import SendIcon from '../../assets/icons/send.svg'
import ResizingMultilineInput from '../ResizingMultilineInput'

const todayOrDate = (date: Date) =>
  dateIsToday(date) ? "Aujourd'hui" : `Le ${formatDayDate(date)}`

type ConversationProps = {
  conseillers: ConseillerHistorique[]
  jeuneChat: JeuneChat
  onBack: () => void
}

export default function Conversation({
  jeuneChat,
  conseillers,
  onBack,
}: ConversationProps) {
  const { data: session } = useSession<true>({ required: true })
  const messagesService = useDependance<MessagesService>('messagesService')

  const [newMessage, setNewMessage] = useState('')
  const [messagesByDay, setMessagesByDay] = useState<MessagesOfADay[]>([])

  const [lastSeenByJeune, setLastSeenByJeune] = useState<Date | undefined>(
    undefined
  )
  const inputFocused = useRef<boolean>(false)

  function scrollToRef(message: HTMLLIElement | null) {
    if (message) message.scrollIntoView({ behavior: 'smooth' })
  }

  function onInputFocused() {
    inputFocused.current = true
    setReadByConseiller(jeuneChat.chatId)
  }

  async function sendNouveauMessage(event: any) {
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

  function getConseillerNomComplet(message: Message) {
    const conseiller = conseillers.find((c) => c.id === message.conseillerId)
    if (conseiller) {
      return `${conseiller?.prenom.toLowerCase()} ${conseiller?.nom.toLowerCase()}`
    }
  }

  const setReadByConseiller = useCallback(
    (idChatToUpdate: string) => {
      messagesService.setReadByConseiller(idChatToUpdate)
    },
    [messagesService]
  )

  const observerMessages = useCallback(
    (idChatToObserve: string) => {
      return messagesService.observeMessages(
        idChatToObserve,
        (messagesGroupesParJour: MessagesOfADay[]) => {
          setMessagesByDay(messagesGroupesParJour)

          if (inputFocused.current) {
            setReadByConseiller(idChatToObserve)
          }
        }
      )
    },
    [messagesService, setReadByConseiller]
  )

  const observerLastJeuneReadingDate = useCallback(
    (idChatToObserve: string) => {
      return messagesService.observeJeuneReadingDate(
        idChatToObserve,
        setLastSeenByJeune
      )
    },
    [messagesService]
  )

  useEffect(() => {
    const unsubscribe = observerMessages(jeuneChat.chatId)
    setReadByConseiller(jeuneChat.chatId)

    return () => unsubscribe()
  }, [jeuneChat.chatId, observerMessages, setReadByConseiller])

  useEffect(() => {
    const unsubscribe = observerLastJeuneReadingDate(jeuneChat.chatId)
    return () => unsubscribe()
  }, [jeuneChat.chatId, observerLastJeuneReadingDate])

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
        {messagesByDay.map((messagesOfADay: MessagesOfADay) => (
          <li key={messagesOfADay.date.getTime()} className='mb-5'>
            <div className={`text-md text-bleu text-center mb-3`}>
              <span>{todayOrDate(messagesOfADay.date)}</span>
            </div>

            <ul>
              {messagesOfADay.messages.map((message: Message) => (
                <li
                  key={message.id}
                  className='mb-5'
                  ref={scrollToRef}
                  data-testid={message.id}
                >
                  <div
                    className={`text-md break-words max-w-[90%] p-4 rounded-large w-max ${
                      message.sentBy === 'conseiller'
                        ? 'text-right text-blanc bg-bleu_nuit mt-0 mr-0 mb-1 ml-auto'
                        : 'text-left text-bleu_nuit bg-bleu_blanc mb-1'
                    }`}
                  >
                    {message.sentBy === 'conseiller' && (
                      <p className='text-sm-regular capitalize mb-1'>
                        {getConseillerNomComplet(message)}
                      </p>
                    )}
                    <p className='whitespace-pre-wrap'>{message.content}</p>
                  </div>
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
                        {!lastSeenByJeune ||
                        isDateOlder(lastSeenByJeune, message.creationDate)
                          ? ' · Envoyé'
                          : ' · Lu'}
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <form
        data-testid='newMessageForm'
        onSubmit={sendNouveauMessage}
        className='w-full bg-blanc p-3 flex items-end'
      >
        <label htmlFor='input-new-message' className='sr-only'>
          Message à envoyer
        </label>
        <ResizingMultilineInput
          id='input-new-message'
          className='flex-grow p-4 bg-bleu_blanc mr-2 rounded-x_large border-0 text-md text-bleu_nuit border-none'
          onFocus={onInputFocused}
          onBlur={() => (inputFocused.current = false)}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder='Écrivez votre message ici...'
          minRows={3}
          maxRows={7}
        />

        <button
          type='submit'
          aria-label='Envoyer le message'
          disabled={!newMessage}
          className='bg-bleu_nuit w-12 h-12 border-none rounded-[50%] shrink-0'
        >
          <SendIcon aria-hidden='true' focusable='false' className='m-auto' />
        </button>
      </form>
    </div>
  )
}
