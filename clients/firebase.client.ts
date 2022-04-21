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
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { Message } from 'interfaces'
import { Chat } from 'interfaces/jeune'
import { captureRUMError } from 'utils/monitoring/init-rum'

class FirebaseClient {
  private readonly firebaseApp: FirebaseApp
  private readonly auth: Auth
  private readonly collectionName: string
  private isSignedIn: boolean | null = null

  constructor() {
    this.firebaseApp = FirebaseClient.retrieveApp()
    this.auth = getAuth(this.firebaseApp)
    this.auth.onAuthStateChanged((user) => {
      this.isSignedIn = Boolean(user)
    })
    this.collectionName = process.env.FIREBASE_COLLECTION_NAME || ''
  }

  async signIn(token: string): Promise<void> {
    const temps_attente = 20
    while (this.isSignedIn == null) {
      await new Promise((r) => setTimeout(r, temps_attente))
    }
    if (!this.isSignedIn) {
      await signInWithCustomToken(this.auth, token)
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth)
  }

  async addMessage(
    idChat: string,
    idConseiller: string,
    message: { encryptedText: string; iv: string },
    date: Date
  ): Promise<void> {
    const { encryptedText: content, iv } = message
    try {
      await addDoc<FirebaseMessage>(
        collection(
          this.getChatReference(idChat),
          'messages'
        ) as CollectionReference<FirebaseMessage>,
        {
          content,
          iv,
          conseillerId: idConseiller,
          sentBy: 'conseiller',
          creationDate: Timestamp.fromDate(date),
        }
      )
    } catch (e) {
      console.error(e)
      captureRUMError(e as Error)
      throw e
    }
  }

  async updateChat(idChat: string, toUpdate: Partial<Chat>): Promise<void> {
    try {
      await updateDoc<FirebaseChat>(
        this.getChatReference(idChat),
        chatToFirebase(toUpdate)
      )
    } catch (e) {
      console.error(e)
      captureRUMError(e as Error)
      throw e
    }
  }

  findAndObserveChatDuJeune(
    idConseiller: string,
    idJeune: string,
    onChatFound: (chat: Chat) => void
  ): () => void {
    try {
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
          const docSnapshot = querySnapshot.docs[0]
          onChatFound(chatFromFirebase(docSnapshot.id, docSnapshot.data()))
        }
      )
    } catch (e) {
      console.error(e)
      captureRUMError(e as Error)
      throw e
    }
  }

  async getChatsDesJeunes(
    idConseiller: string,
    idsJeunes: string[]
  ): Promise<{ [idJeune: string]: Chat }> {
    try {
      // firestore limits 'in' query to 10
      const docSnapshots = await this.getFirebaseChatsByBatches(
        idConseiller,
        idsJeunes
      )
      return docSnapshots.reduce((mappedChats, document) => {
        const firebaseChat: FirebaseChat = document.data()
        mappedChats[firebaseChat.jeuneId] = chatFromFirebase(
          document.id,
          firebaseChat
        )
        return mappedChats
      }, {} as { [idJeune: string]: Chat })
    } catch (e) {
      console.error(e)
      captureRUMError(e as Error)
      throw e
    }
  }

  observeChat(idChat: string, onChat: (chat: Chat) => void): () => void {
    try {
      return onSnapshot(
        this.getChatReference(idChat),
        (docSnapshot: DocumentSnapshot<FirebaseChat>) => {
          const data = docSnapshot.data()
          if (!data) return
          onChat(chatFromFirebase(docSnapshot.id, data))
        }
      )
    } catch (e) {
      console.error(e)
      captureRUMError(e as Error)
      throw e
    }
  }

  observeMessagesDuChat(
    idChat: string,
    onMessages: (messages: Message[]) => void
  ): () => void {
    try {
      return onSnapshot<FirebaseMessage>(
        query<FirebaseMessage>(
          collection(
            this.getChatReference(idChat),
            'messages'
          ) as CollectionReference<FirebaseMessage>,
          orderBy('creationDate')
        ),
        (querySnapshot: QuerySnapshot<FirebaseMessage>) => {
          const messages: Message[] = querySnapshot.docs.map((docSnapshot) => {
            const firebaseMessage: FirebaseMessage = docSnapshot.data()
            return {
              ...firebaseMessage,
              creationDate: firebaseMessage.creationDate.toDate(),
              id: docSnapshot.id,
            }
          })

          if (!messages || !messages[messages.length - 1]?.creationDate) {
            return
          }

          onMessages(messages)
        }
      )
    } catch (e) {
      console.error(e)
      captureRUMError(e as Error)
      throw e
    }
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

  private async getFirebaseChatsByBatches(
    idConseiller: string,
    idsJeunes: string[]
  ): Promise<QueryDocumentSnapshot<FirebaseChat>[]> {
    if (!idsJeunes.length) return []

    const collectionRef = collection(
      this.getDb(),
      this.collectionName
    ) as CollectionReference<FirebaseChat>

    const batches: Promise<QuerySnapshot<FirebaseChat>>[] = []
    const ids = [...idsJeunes]
    while (ids.length) {
      const batch = ids.splice(0, 10)
      const q = query<FirebaseChat>(
        collectionRef,
        where('conseillerId', '==', idConseiller),
        where('jeuneId', 'in', [...batch])
      )
      batches.push(getDocs(q))
    }

    const querySnapshots = await Promise.all(batches)
    return querySnapshots.flatMap((querySnapshot) => querySnapshot.docs)
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
  jeuneId: string
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

function chatFromFirebase(chatId: string, firebaseChat: FirebaseChat): Chat {
  return {
    chatId: chatId,
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
  creationDate: Timestamp
  sentBy: string
  content: string
  iv: string | undefined
  conseillerId: string | undefined
}

export { FirebaseClient }
