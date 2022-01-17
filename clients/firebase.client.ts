import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import { Auth, getAuth, signInWithCustomToken, signOut } from 'firebase/auth'
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { Message } from 'interfaces'
import { Chat } from 'interfaces/jeune'

class FirebaseClient {
  private readonly firebaseApp: FirebaseApp
  private readonly auth: Auth
  private readonly collectionName: string

  constructor() {
    this.firebaseApp = FirebaseClient.retrieveApp()
    this.auth = getAuth()
    this.collectionName = process.env.FIREBASE_COLLECTION_NAME || ''
  }

  async signIn(token: string): Promise<void> {
    if (!this.auth.currentUser) {
      await signInWithCustomToken(this.auth, token)
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth)
  }

  async addMessage(
    idChat: string,
    message: { encryptedText: string; iv: string },
    date: Date
  ): Promise<void> {
    const { encryptedText: content, iv } = message
    await addDoc<FirebaseMessage>(
      collection(
        this.getChatReference(idChat),
        'messages'
      ) as CollectionReference<FirebaseMessage>,
      {
        content,
        iv,
        sentBy: 'conseiller',
        creationDate: Timestamp.fromDate(date),
      }
    )
  }

  async updateChat(idChat: string, toUpdate: Partial<Chat>): Promise<void> {
    await updateDoc<FirebaseChat>(
      this.getChatReference(idChat),
      chatToFirebase(toUpdate)
    )
  }

  findChatDuJeune(
    idConseiller: string,
    idJeune: string,
    onChatFound: (id: string, chat: Chat) => void
  ): () => void {
    return onSnapshot<FirebaseChat>(
      query<FirebaseChat>(
        collection(
          this.getDb(),
          this.collectionName
        ) as CollectionReference<FirebaseChat>,
        where('conseillerId', '==', idConseiller),
        where('jeuneId', '==', idJeune)
      ),
      (querySnapshot: QuerySnapshot<FirebaseChat>) => {
        if (querySnapshot.empty) return
        const doc = querySnapshot.docs[0]
        onChatFound(doc.id, chatFromFirebase(doc.data()))
      }
    )
  }

  observeChat(idChat: string, onChat: (chat: Chat) => void): () => void {
    return onSnapshot(
      this.getChatReference(idChat),
      (docSnapshot: DocumentSnapshot<FirebaseChat>) => {
        const data = docSnapshot.data()
        if (!data) return
        onChat(chatFromFirebase(data))
      }
    )
  }

  observeMessagesDuChat(
    idChat: string,
    onMessages: (messages: Message[]) => void
  ): () => void {
    return onSnapshot<FirebaseMessage>(
      query<FirebaseMessage>(
        collection(
          this.getChatReference(idChat),
          'messages'
        ) as CollectionReference<FirebaseMessage>,
        orderBy('creationDate')
      ),
      (querySnapshot: QuerySnapshot<FirebaseMessage>) => {
        const messages: Message[] = querySnapshot.docs.map((doc) => {
          const firebaseMessage: FirebaseMessage = doc.data()
          return {
            ...firebaseMessage,
            creationDate: firebaseMessage.creationDate.toDate(),
            id: doc.id,
          }
        })

        if (!messages || !messages[messages.length - 1]?.creationDate) {
          return
        }

        onMessages(messages)
      }
    )
  }

  private static retrieveApp() {
    const appAlreadyInitialized: number = getApps().length
    if (!appAlreadyInitialized) {
      return initializeApp({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      })
    } else {
      return getApp()
    }
  }

  private getDb(): Firestore {
    return getFirestore(this.firebaseApp)
  }

  private getChatReference(idChat: string): DocumentReference<FirebaseChat> {
    return doc<FirebaseChat>(
      collection(
        this.getDb(),
        this.collectionName
      ) as CollectionReference<FirebaseChat>,
      idChat
    )
  }
}

interface FirebaseChat {
  seenByConseiller: boolean
  newConseillerMessageCount: number
  lastMessageContent: string | undefined
  lastMessageSentAt: Timestamp | undefined
  lastMessageSentBy: string | undefined
  lastConseillerReading: Timestamp | undefined
  lastJeuneReading: Timestamp | undefined
  lastMessageIv: string | undefined
}

function chatToFirebase(chat: Partial<Chat>): Partial<FirebaseChat> {
  const firebaseChatToUpdate: Partial<FirebaseChat> = {}
  if (chat.seenByConseiller) {
    firebaseChatToUpdate.seenByConseiller = chat.seenByConseiller
  }
  if (chat.newConseillerMessageCount) {
    firebaseChatToUpdate.newConseillerMessageCount =
      chat.newConseillerMessageCount
  }
  if (chat.lastMessageContent) {
    firebaseChatToUpdate.lastMessageContent = chat.lastMessageContent
  }
  if (chat.lastMessageSentAt) {
    firebaseChatToUpdate.lastMessageSentAt = Timestamp.fromDate(
      chat.lastMessageSentAt
    )
  }
  if (chat.lastMessageSentBy) {
    firebaseChatToUpdate.lastMessageSentBy = chat.lastMessageSentBy
  }
  if (chat.lastConseillerReading) {
    firebaseChatToUpdate.lastConseillerReading = Timestamp.fromDate(
      chat.lastConseillerReading
    )
  }
  if (chat.lastJeuneReading) {
    firebaseChatToUpdate.lastJeuneReading = Timestamp.fromDate(
      chat.lastJeuneReading
    )
  }
  if (chat.lastMessageIv) {
    firebaseChatToUpdate.lastMessageIv = chat.lastMessageIv
  }
  return firebaseChatToUpdate
}

function chatFromFirebase(firebaseChat: FirebaseChat): Chat {
  return {
    seenByConseiller: firebaseChat.seenByConseiller,
    newConseillerMessageCount: firebaseChat.newConseillerMessageCount,
    lastMessageContent: firebaseChat.lastMessageContent,
    lastMessageSentAt: firebaseChat.lastMessageSentAt?.toDate(),
    lastMessageSentBy: firebaseChat.lastMessageSentBy,
    lastConseillerReading: firebaseChat.lastConseillerReading?.toDate(),
    lastJeuneReading: firebaseChat.lastJeuneReading?.toDate(),
    lastMessageIv: firebaseChat.lastMessageIv,
  }
}

interface FirebaseMessage {
  content: string
  creationDate: Timestamp
  sentBy: string
  iv: string | undefined
}

export { FirebaseClient }
