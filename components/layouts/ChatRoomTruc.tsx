import {
  collection,
  CollectionReference,
  Firestore,
  onSnapshot,
  query,
  QuerySnapshot,
} from 'firebase/firestore'
import { Jeune, JeuneChat } from 'interfaces/jeune'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { ChatCrypto } from 'utils/chat/chatCrypto'

const collectionNameOld = 'staging-chat'
const collectionNameNew = 'staging'

type ChatBoxProps = {
  db: Firestore
}

export default function ChatBox({ db }: ChatBoxProps) {
  const { data: session } = useSession({ required: true })

  const [jeunes, setJeunes] = useState<Jeune[]>([])

  let encodage: ChatCrypto = new ChatCrypto('')

  useEffect(() => {
    async function observeJeuneChats(): Promise<void> {
      jeunes.forEach((jeune: Jeune) =>
        onSnapshot(
          query<JeuneChat>(
            collection(db, collectionNameOld) as CollectionReference<JeuneChat>
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
              lastMessageContent: data.lastMessageIv
                ? encodage.decrypt({
                    encryptedText: data.lastMessageContent || '',
                    iv: data.lastMessageIv || '',
                  })
                : data.lastMessageContent,
              lastMessageSentAt: data.lastMessageSentAt,
              lastMessageSentBy: data.lastMessageSentBy,
              lastConseillerReading: data.lastConseillerReading,
              lastJeuneReading: data.lastJeuneReading,
              lastMessageIv: data.lastMessageIv,
            }
          }
        )
      )
    }

    observeJeuneChats()
  }, [db, jeunes, session])

  return <></>
}
