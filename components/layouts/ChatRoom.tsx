import Conversation from 'components/layouts/Conversation'
import {
  collection,
  CollectionReference,
  Firestore,
  onSnapshot,
  query,
  QuerySnapshot,
  Timestamp,
  where,
} from 'firebase/firestore'
import { Jeune, JeuneChat } from 'interfaces'
import { useEffect, useState } from 'react'
import styles from 'styles/components/Layouts.module.css'
import { formatDayAndHourDate } from 'utils/date'
import fetchJson from 'utils/fetchJson'
import EmptyMessagesImage from '../../assets/icons/empty_message.svg'
import FbCheckIcon from '../../assets/icons/fb_check.svg'
import FbCheckFillIcon from '../../assets/icons/fb_check_fill.svg'

// TODO : supprimer ?
const defaultChat: JeuneChat = {
  id: 'default',
  firstName: '',
  lastName: '',
  seenByConseiller: true,
  newConseillerMessageCount: 0,
  lastMessageContent: '',
  lastMessageSentBy: 'conseiller',
  lastMessageSentAt: new Timestamp(1562524200, 0),
  lastConseillerReading: new Timestamp(1562524200, 0),
  lastJeuneReading: new Timestamp(1562524200, 0),
}

const collectionName = process.env.FIREBASE_COLLECTION_NAME || ''

let currentJeunesChat: JeuneChat[] = [] // had to use extra variable since jeunesChats is always empty in useEffect

type ChatBoxProps = {
  db: Firestore
}

export default function ChatBox({ db }: ChatBoxProps) {
  const [jeunesChats, setJeunesChats] = useState<JeuneChat[]>([])
  const [jeunes, setJeunes] = useState<Jeune[]>([])
  const [selectedChat, setSelectedChat] = useState<JeuneChat>(defaultChat)

  const isInChatRoom = () => Boolean(selectedChat === defaultChat)

  useEffect(() => {
    async function fetchJeunes(): Promise<Jeune[]> {
      const { id } = await fetchJson('/api/user')
      const jeunes = await fetchJson(
        `${process.env.API_ENDPOINT}/conseillers/${id}/jeunes`
      )

      return jeunes || []
    }

    fetchJeunes().then((data) => {
      setJeunes(data)
      currentJeunesChat = []
    })
  }, [])

  useEffect(() => {
    async function observeJeuneChats(): Promise<void> {
      jeunes.forEach((jeune: Jeune) =>
        onSnapshot(
          query<JeuneChat>(
            collection(db, collectionName) as CollectionReference<JeuneChat>,
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
              lastMessageContent:
                data.lastMessageContent || defaultChat.lastMessageContent,
              lastMessageSentAt:
                data.lastMessageSentAt || defaultChat.lastMessageSentAt,
              lastMessageSentBy:
                data.lastMessageSentBy || defaultChat.lastMessageSentBy,
              lastConseillerReading:
                data.lastConseillerReading || defaultChat.lastConseillerReading,
              lastJeuneReading:
                data.lastJeuneReading || defaultChat.lastJeuneReading,
            }

            updateJeunesChat(newJeuneChat)
          }
        )
      )
    }

    observeJeuneChats()
  }, [db, jeunes])

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
      {!isInChatRoom() && (
        <Conversation
          onBack={() => setSelectedChat(defaultChat)}
          db={db}
          jeune={selectedChat}
        />
      )}

      {isInChatRoom() && (
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
                              jeuneChat.lastMessageSentAt.toDate()
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
