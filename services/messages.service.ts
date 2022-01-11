import { ApiClient } from 'clients/api.client'
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  DocumentSnapshot,
  increment,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { Message, MessagesOfADay } from 'interfaces'
import { Jeune, JeuneChat } from 'interfaces/jeune'
import { ChatCrypto } from 'utils/chat/chatCrypto'
import { formatDayDate } from 'utils/date'
import { FirebaseClient } from 'utils/firebaseClient'

const collectionName = process.env.FIREBASE_COLLECTION_NAME || ''
export interface MessagesService {
  signIn(token: string): Promise<void>

  signOut(): Promise<void>

  sendNouveauMessage(
    conseiller: { id: string; structure: string },
    jeune: Jeune,
    newMessage: string,
    accessToken: string
  ): void

  setReadByConseiller(jeune: Jeune): void

  observeChat(
    idConseiller: string,
    jeune: Jeune,
    updateChat: (chat: JeuneChat) => void
  ): () => void

  observeMessages(
    jeune: Jeune,
    onMessagesGroupesParJour: (messagesGroupesParJour: MessagesOfADay[]) => void
  ): () => void

  observeJeuneReadingDate(
    jeune: Jeune,
    onJeuneReadingDate: (date: Date) => void
  ): () => void
}

export class MessagesFirebaseAndApiService implements MessagesService {
  private readonly firebaseClient: FirebaseClient
  private readonly chatCrypto: ChatCrypto
  constructor(private readonly apiClient: ApiClient) {
    this.firebaseClient = new FirebaseClient()
    this.chatCrypto = new ChatCrypto()
  }

  async signOut(): Promise<void> {
    await this.firebaseClient.signOut()
  }

  async signIn(token: string): Promise<void> {
    if (!this.firebaseClient.firebaseIsSignedIn()) {
      await this.firebaseClient.signIn(token)
    }
  }

  async sendNouveauMessage(
    conseiller: { id: string; structure: string },
    jeune: Jeune,
    newMessage: string,
    accessToken: string
  ) {
    const firestoreNow = serverTimestamp()
    const chatRef: DocumentReference = this.getChatReference(jeune)
    const { encryptedText, iv } = this.chatCrypto.encrypt(newMessage)

    await Promise.all([
      addDoc(collection(chatRef, 'messages'), {
        content: encryptedText,
        creationDate: firestoreNow,
        sentBy: 'conseiller',
        iv,
      }),
      updateDoc(chatRef, {
        newConseillerMessageCount: increment(1),
        lastMessageContent: encryptedText,
        lastMessageIv: iv,
        lastMessageSentAt: firestoreNow,
        lastMessageSentBy: 'conseiller',
        seenByConseiller: true,
        lastConseillerReading: serverTimestamp(),
      }),
    ])

    await Promise.all([
      this.notifierNouveauMessage(conseiller.id, jeune.id, accessToken),
      this.evenementNouveauMessage(
        conseiller.structure,
        conseiller.id,
        accessToken
      ),
    ])
  }

  async setReadByConseiller(jeune: Jeune): Promise<void> {
    await updateDoc<JeuneChat>(this.getChatReference(jeune), {
      seenByConseiller: true,
      lastConseillerReading: serverTimestamp(),
    })
  }

  observeChat(
    idConseiller: string,
    jeune: Jeune,
    updateChat: (chat: JeuneChat) => void
  ): () => void {
    return onSnapshot(
      query<JeuneChat>(
        collection(
          this.firebaseClient.getDb(),
          collectionName
        ) as CollectionReference<JeuneChat>,
        where('conseillerId', '==', idConseiller),
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
          lastMessageContent: data.lastMessageIv
            ? this.chatCrypto.decrypt({
                encryptedText: data.lastMessageContent ?? '',
                iv: data.lastMessageIv,
              })
            : data.lastMessageContent,
          lastMessageSentAt: data.lastMessageSentAt,
          lastMessageSentBy: data.lastMessageSentBy,
          lastConseillerReading: data.lastConseillerReading,
          lastJeuneReading: data.lastJeuneReading,
          lastMessageIv: data.lastMessageIv,
        }

        updateChat(newJeuneChat)
      }
    )
  }

  observeMessages(
    jeune: Jeune,
    onMessagesGroupesParJour: (messagesGroupesParJour: MessagesOfADay[]) => void
  ): () => void {
    return onSnapshot(
      query(
        collection(this.getChatReference(jeune), 'messages'),
        orderBy('creationDate')
      ),
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

        const messagesGroupesParJour: MessagesOfADay[] =
          this.grouperMessagesParJour(currentMessages)
        onMessagesGroupesParJour(messagesGroupesParJour)
      }
    )
  }

  observeJeuneReadingDate(
    jeune: Jeune,
    onJeuneReadingDate: (date: Date) => void
  ): () => void {
    return onSnapshot(
      this.getChatReference(jeune),
      (docSnapshot: DocumentSnapshot<JeuneChat>) => {
        const lastJeuneReadingDate: Timestamp | undefined =
          docSnapshot.data()?.lastJeuneReading
        if (lastJeuneReadingDate) {
          onJeuneReadingDate(lastJeuneReadingDate!.toDate())
        }
      }
    )
  }

  private async notifierNouveauMessage(
    idConseiller: string,
    idJeune: string,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.post(
      `/conseillers/${idConseiller}/jeunes/${idJeune}/notify-message`,
      undefined,
      accessToken
    )
  }

  private async evenementNouveauMessage(
    structure: string,
    idConseiller: string,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.post(
      '/evenements',
      {
        type: 'MESSAGE_ENVOYE',
        emetteur: {
          type: 'CONSEILLER',
          structure: structure,
          id: idConseiller,
        },
      },
      accessToken
    )
  }

  private grouperMessagesParJour(messages: Message[]) {
    const messagesByDay: { [day: string]: MessagesOfADay } = {}

    messages.forEach((message: Message) => {
      message.content = message.iv
        ? this.chatCrypto.decrypt({
            encryptedText: message.content,
            iv: message.iv,
          })
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

  private getChatReference(jeune: Jeune): DocumentReference<JeuneChat> {
    return doc<JeuneChat>(
      collection(
        this.firebaseClient.getDb(),
        collectionName
      ) as CollectionReference<JeuneChat>,
      jeune.chatId
    )
  }
}
