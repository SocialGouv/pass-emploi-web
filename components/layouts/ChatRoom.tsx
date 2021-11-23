import Conversation from 'components/layouts/Conversation'
import {
  collection,
  CollectionReference,
  Firestore,
  getDocs,
  query,
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
      const data = await fetchJson(
        `${process.env.API_ENDPOINT}/conseillers/${id}/login`
      )

      return data?.jeunes || []
    }

    fetchJeunes().then((data) => {
      setJeunes(data)
      currentJeunesChat = []
    })
  }, [])

  useEffect(() => {
    async function fetchFirebaseData(): Promise<JeuneChat[]> {
      const chats: Array<JeuneChat | undefined> = await Promise.all(
        jeunes.map((jeune: Jeune) =>
          getDocs(
            query<JeuneChat>(
              collection(db, collectionName) as CollectionReference<JeuneChat>,
              where('jeuneId', '==', jeune.id)
            )
          ).then((querySnapshot) => {
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
            return newJeuneChat
          })
        )
      )

      return chats.filter(exists)
    }

    fetchFirebaseData()
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

  function exists(chat: JeuneChat | undefined): chat is JeuneChat {
    return chat !== undefined
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
              (jeune: JeuneChat) =>
                jeune.chatId && (
                  <li key={`chat-${jeune.id}`}>
                    <button onClick={() => setSelectedChat(jeune)}>
                      <span className='text-lg-semi text-bleu_nuit w-full mb-[7px]'>
                        {jeune.firstName} {jeune.lastName}
                        {!jeune.seenByConseiller && (
                          <span className='text-violet text-xs border px-[7px] py-[5px] float-right rounded-x_small'>
                            Nouveau message
                          </span>
                        )}
                      </span>
                      <span className='text-sm text-bleu_gris mb-[8px]'>
                        {' '}
                        {jeune.lastMessageSentBy === 'conseiller'
                          ? 'Vous'
                          : jeune.firstName}{' '}
                        : {jeune.lastMessageContent}
                      </span>
                      <span className='text-xxs-italic text-bleu_nuit self-end flex'>
                        {jeune.lastMessageContent && (
                          <span className='mr-[7px]'>
                            {formatDayAndHourDate(
                              jeune.lastMessageSentAt.toDate()
                            )}{' '}
                          </span>
                        )}
                        {jeune.seenByConseiller ? (
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
