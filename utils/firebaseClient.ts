import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  Auth,
  getAuth,
  signInWithCustomToken,
  signOut,
  UserCredential,
} from 'firebase/auth'
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

  private static retrieveApp() {
    if (!getApps().length) {
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
      return getApp() // if already initialized, use that one
    }
  }

  getDb(): Firestore {
    return getFirestore(this.firebaseApp)
  }

  signIn(token: string): Promise<UserCredential> {
    return signInWithCustomToken(this.auth, token)
  }

  signOut(): Promise<void> {
    return signOut(this.auth)
  }

  firebaseIsSignedIn(): boolean {
    return Boolean(this.auth.currentUser)
  }

  async addMessage(
    idChat: string,
    message: { encryptedText: string; iv: string },
    date: Date
  ): Promise<void> {
    const { encryptedText: content, iv } = message
    await addDoc(collection(this.getChatReference(idChat), 'messages'), {
      content,
      iv,
      sentBy: 'conseiller',
      creationDate: Timestamp.fromDate(date),
    })
  }

  async updateChat(idChat: string, toUpdate: Partial<Chat>): Promise<void> {
    await updateDoc<Chat>(this.getChatReference(idChat), toUpdate)
  }

  findChatDuJeune(
    idConseiller: string,
    idJeune: string,
    onChatFound: (id: string, chat: Chat) => void
  ): () => void {
    return onSnapshot(
      query<Chat>(
        collection(
          this.getDb(),
          this.collectionName
        ) as CollectionReference<Chat>,
        where('conseillerId', '==', idConseiller),
        where('jeuneId', '==', idJeune)
      ),
      (querySnapshot: QuerySnapshot<Chat>) => {
        if (querySnapshot.empty) return
        const doc = querySnapshot.docs[0]
        onChatFound(doc.id, doc.data())
      }
    )
  }

  observeChat(idChat: string, onChat: (chat: Chat) => void): () => void {
    return onSnapshot(
      this.getChatReference(idChat),
      (docSnapshot: DocumentSnapshot<Chat>) => {
        const data = docSnapshot.data()
        if (!data) return
        onChat(data)
      }
    )
  }

  observeMessagesDuChat(
    idChat: string,
    onMessages: (messages: Message[]) => void
  ): () => void {
    return onSnapshot(
      query(
        collection(this.getChatReference(idChat), 'messages'),
        orderBy('creationDate')
      ),
      (querySnapshot: QuerySnapshot) => {
        const messages = querySnapshot.docs.map((doc: any) => ({
          ...doc.data(),
          id: doc.id,
        }))

        if (!messages || !messages[messages.length - 1]?.creationDate) {
          return
        }

        onMessages(messages)
      }
    )
  }

  private getChatReference(idChat: string): DocumentReference<Chat> {
    return doc<Chat>(
      collection(
        this.getDb(),
        this.collectionName
      ) as CollectionReference<Chat>,
      idChat
    )
  }
}

export { FirebaseClient }
