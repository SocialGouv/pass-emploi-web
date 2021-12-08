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
import {
  DailyMessages,
  Jeune,
  JeuneChat,
  ListDailyMessages,
  Message,
} from 'interfaces'
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
  const { messagesService } = useDIContext()

  const [newMessage, setNewMessage] = useState('')
  const [dailyMessages, setDailyMessages] = useState<DailyMessages[]>([])
  const [lastSeenByJeune, setLastSeenByJeune] = useState<Date>(new Date())

  const dummySpace = useRef<HTMLLIElement>(null)

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
    addDoc(collection(chatRef, 'messages'), {
      content: newMessage,
      creationDate: firestoreNow,
      sentBy: 'conseiller',
    })

    updateDoc(chatRef, {
      seenByConseiller: true,
      newConseillerMessageCount: increment(1),
      lastMessageContent: newMessage,
      lastMessageSentAt: firestoreNow,
      lastMessageSentBy: 'conseiller',
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

    if (dummySpace && dummySpace.current) {
      dummySpace.current.scrollIntoView({ block: 'end', inline: 'nearest' })
    }
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

        setDailyMessages(new ListDailyMessages(currentMessages).dailyMessages)
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
        {dailyMessages.map(
          (dailyMessage: DailyMessages, dailyIndex: number) => (
            <li key={dailyMessage.date.getTime()}>
              <div className={`text-md text-bleu ${styles.day}`}>
                <span>{todayOrDate(dailyMessage.date)}</span>
              </div>

              <ul>
                {dailyMessage.messages.map(
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

                      {dailyIndex === dailyMessages.length - 1 &&
                        index === dailyMessage.messages.length - 1 && (
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
