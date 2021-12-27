import Conversation from 'components/layouts/Conversation'
import {
  collection,
  CollectionReference,
  Firestore,
  onSnapshot,
  query,
  QuerySnapshot,
  where,
} from 'firebase/firestore'
import { Jeune, JeuneChat } from 'interfaces/jeune'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import styles from 'styles/components/Layouts.module.css'
import { formatDayAndHourDate } from 'utils/date'
import { firebaseIsSignedIn, signInChat } from 'utils/firebase'
import { useDIContext } from 'utils/injectionDependances'
import EmptyMessagesImage from '../../assets/icons/empty_message.svg'
import FbCheckIcon from '../../assets/icons/fb_check.svg'
import FbCheckFillIcon from '../../assets/icons/fb_check_fill.svg'

const collectionName = process.env.FIREBASE_COLLECTION_NAME || ''

let currentJeunesChat: JeuneChat[] = [] // had to use extra variable since jeunesChats is always empty in useEffect

type ChatBoxProps = {
  db: Firestore
}

export default function ChatBox({ db }: ChatBoxProps) {
  const { data: session } = useSession({ required: true })
  const { jeunesService } = useDIContext()

  const [jeunesChats, setJeunesChats] = useState<JeuneChat[]>([])
  const [jeunes, setJeunes] = useState<Jeune[]>([])
  const [selectedChat, setSelectedChat] = useState<JeuneChat | undefined>(
    undefined
  )

  const isInConversation = () => Boolean(selectedChat !== undefined)

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
    async function signInFirebase() {
      if (!firebaseIsSignedIn() && session && session.firebaseToken) {
        await signInChat(session.firebaseToken)
      }
    }

    async function observeJeuneChats(): Promise<void> {
      jeunes.forEach((jeune: Jeune) =>
        onSnapshot(
          query<JeuneChat>(
            collection(db, collectionName) as CollectionReference<JeuneChat>,
            where('conseillerId', '==', session!.user.id),
            where('jeuneId', '==', jeune.id)
          ),
          (querySnapshot: QuerySnapshot<JeuneChat>) => {
            if (querySnapshot.empty) return

            const doc = querySnapshot.docs[0]
            const data = doc.data()
            const newJeuneChat: JeuneChat = {
              ...jeune,
              chatId: doc.id,
              seenByConseiller: data.seenByConseiller ?? true,
              newConseillerMessageCount: data.newConseillerMessageCount,
              lastMessageContent: data.lastMessageContent,
              lastMessageSentAt: data.lastMessageSentAt,
              lastMessageSentBy: data.lastMessageSentBy,
              lastConseillerReading: data.lastConseillerReading,
              lastJeuneReading: data.lastJeuneReading,
            }

            updateJeunesChat(newJeuneChat)
          }
        )
      )
    }

    signInFirebase().then(() => {
      observeJeuneChats()
    })
  }, [db, jeunes, session])

  function updateJeunesChat(newJeuneChat: JeuneChat) {
    const idxOfJeune = currentJeunesChat.findIndex(
      (j) => j.chatId === newJeuneChat.chatId
    )

    if (idxOfJeune !== -1) {
      currentJeunesChat[idxOfJeune] = newJeuneChat
    } else {
      currentJeunesChat.push(newJeuneChat)
    }

    setJeunesChats([...currentJeunesChat])
  }

  return (
    <article className={styles.chatRoom}>
      {isInConversation() && (
        <Conversation
          onBack={() => setSelectedChat(undefined)}
          db={db}
          jeune={selectedChat!}
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
                    <button onClick={() => setSelectedChat(jeuneChat)}>
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
                            {formatDayAndHourDate(
                              jeuneChat.lastMessageSentAt!.toDate()
                            )}{' '}
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
