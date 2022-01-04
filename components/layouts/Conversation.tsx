import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  increment,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { Message, MessagesOfADay } from 'interfaces'
import { Jeune, JeuneChat } from 'interfaces/jeune'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from 'styles/components/Layouts.module.css'
import {
  dateIsToday,
  formatDayDate,
  formatHourMinuteDate,
  isDateOlder,
} from 'utils/date'
import { useDIContext } from 'utils/injectionDependances'
import ChevronLeftIcon from '../../assets/icons/chevron_left.svg'
import SendIcon from '../../assets/icons/send.svg'

const collectionName = process.env.FIREBASE_COLLECTION_NAME || ''

const todayOrDate = (date: Date) =>
  dateIsToday(date) ? "Aujourd'hui" : `Le ${formatDayDate(date)}`

type ConversationProps = {
  db: Firestore
  jeune: Jeune
  onBack: () => void
}

export default function Conversation({ db, jeune, onBack }: ConversationProps) {
  const { data: session } = useSession({ required: true })
  const { messagesService, chatCrypto } = useDIContext()

  const [newMessage, setNewMessage] = useState('')
  const [messagesByDay, setMessagesByDay] = useState<MessagesOfADay[]>([])
  const [lastSeenByJeune, setLastSeenByJeune] = useState<Date>(new Date())

  const dummySpace = useRef<HTMLLIElement>(null)

  function groupMessagesByDay(messages: Message[]): MessagesOfADay[] {
    const messagesByDay: { [day: string]: MessagesOfADay } = {}

    messages.forEach((message: Message) => {
      message.content = message.iv
        ? chatCrypto.decrypt({ encryptedText: message.content, iv: message.iv })
        : message.content
      const day = formatDayDate(message.creationDate.toDate())
      const messagesOfDay = messagesByDay[day] ?? {
        date: message.creationDate.toDate(),
        messages: [],
      }
      messagesOfDay.messages.push(message)
      messagesByDay[day] = messagesOfDay
    })

    return Object.values(messagesByDay)
  }

  const setReadByConseiller = useCallback(() => {
    updateDoc<JeuneChat>(getChatReference(db, jeune), {
      seenByConseiller: true,
      lastConseillerReading: serverTimestamp(),
    })
  }, [db, jeune.chatId])

  const sendNouveauMessage = (event: any) => {
    event.preventDefault()

    const firestoreNow = serverTimestamp()

    const chatRef: DocumentReference = getChatReference(db, jeune)
    const { encryptedText, iv } = chatCrypto.encrypt(newMessage)

    addDoc(collection(chatRef, 'messages'), {
      content: encryptedText,
      creationDate: firestoreNow,
      sentBy: 'conseiller',
      iv,
    })

    updateDoc(chatRef, {
      seenByConseiller: true,
      newConseillerMessageCount: increment(1),
      lastMessageContent: encryptedText,
      lastMessageSentAt: firestoreNow,
      lastMessageSentBy: 'conseiller',
      lastMessageIv: iv,
    })

    setReadByConseiller()

    /**
     * Route send from web to notify mobile, no need to await for response
     */
    messagesService
      .notifierNouveauMessage(session!.user.id, jeune.id, session!.accessToken)
      .catch(function (error) {
        console.error(
          'Conversation: Error while fetching /notify-message',
          error
        )
      })

    setNewMessage('')
  }

  // automatically check db for new messages
  useEffect(() => {
    const messagesChatRef = collection(getChatReference(db, jeune), 'messages')
    const messagesUpdatedEvent = onSnapshot(
      query(messagesChatRef, orderBy('creationDate')),
      (querySnapshot: QuerySnapshot) => {
        // get all documents from collection with id
        const currentMessages = querySnapshot.docs.map((doc: any) => ({
          ...doc.data(),
          id: doc.id,
        }))

        if (
          !currentMessages ||
          !currentMessages[currentMessages.length - 1]?.creationDate
        ) {
          return
        }

        setMessagesByDay(groupMessagesByDay(currentMessages))

        if (dummySpace?.current) {
          dummySpace.current.scrollIntoView({ behavior: 'smooth' })
        }
      }
    )

    setReadByConseiller()

    return () => {
      // unsubscribe
      messagesUpdatedEvent()
    }
  }, [db, jeune.chatId, setReadByConseiller])

  useEffect(() => {
    async function updateReadingDate() {
      onSnapshot(
        getChatReference(db, jeune),
        (docSnapshot: DocumentSnapshot<JeuneChat>) => {
          const lastJeuneReadingDate: Timestamp | undefined =
            docSnapshot.data()?.lastJeuneReading
          if (lastJeuneReadingDate) {
            setLastSeenByJeune(lastJeuneReadingDate?.toDate())
          }
        }
      )
    }

    updateReadingDate()
  }, [db, jeune.chatId])

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
        <h2 className='h2-semi'>Discuter avec {jeune.firstName}</h2>
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
                        {formatHourMinuteDate(message.creationDate.toDate())}
                        {message.sentBy === 'conseiller' && (
                          <span>
                            {isDateOlder(
                              message.creationDate.toDate(),
                              lastSeenByJeune
                            )
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

      <form onSubmit={sendNouveauMessage} className={styles.form}>
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

function getChatReference(
  db: Firestore,
  jeune: Jeune
): DocumentReference<JeuneChat> {
  return doc<JeuneChat>(
    collection(db, collectionName) as CollectionReference<JeuneChat>,
    jeune.chatId
  )
}
