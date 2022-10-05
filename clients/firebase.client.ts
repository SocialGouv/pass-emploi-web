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
import { DateTime } from 'luxon'

import { UserType } from 'interfaces/conseiller'
import { InfoFichier } from 'interfaces/fichier'
import { Chat } from 'interfaces/jeune'
import { InfoOffre, Message, TypeMessage } from 'interfaces/message'
import { DetailOffreEmploi } from 'interfaces/offre-emploi'
import { EncryptedTextWithInitializationVector } from 'utils/chat/chatCrypto'
import { captureRUMError } from 'utils/monitoring/init-rum'

type TypeMessageFirebase =
  | 'NOUVEAU_CONSEILLER'
  | 'MESSAGE'
  | 'MESSAGE_PJ'
  | 'MESSAGE_OFFRE'
  | 'NOUVEAU_CONSEILLER_TEMPORAIRE'

interface FirebaseMessage {
  creationDate: Timestamp
  sentBy: string
  content: string
  iv: string | undefined
  piecesJointes?: InfoFichier[]
  conseillerId: string | undefined
  type: TypeMessageFirebase | undefined
  offre?: InfoOffre
}

type BaseCreateFirebaseMessage = {
  idConseiller: string
  message: EncryptedTextWithInitializationVector
  date: DateTime
}
export type CreateFirebaseMessage = BaseCreateFirebaseMessage & {
  infoPieceJointe?: InfoFichier
}
export type CreateFirebaseMessageWithOffre = BaseCreateFirebaseMessage & {
  offre: DetailOffreEmploi
}

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

  async addMessage(idChat: string, data: CreateFirebaseMessage): Promise<void> {
    const firebaseMessage = createFirebaseMessage(data)
    try {
      await addDoc<FirebaseMessage>(
        collection(
          this.getChatReference(idChat),
          'messages'
        ) as CollectionReference<FirebaseMessage>,
        firebaseMessage
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

  findAndObserveChatsDuConseiller(
    idConseiller: string,
    onChatsFound: (chats: { [idJeune: string]: Chat }) => void
  ): () => void {
    try {
      return onSnapshot<FirebaseChat>(
        query<FirebaseChat>(
          collection(
            this.getDb(),
            this.collectionName
          ) as CollectionReference<FirebaseChat>,
          where('conseillerId', '==', idConseiller)
        ),
        (querySnapshot: QuerySnapshot<FirebaseChat>) => {
          if (querySnapshot.empty) return
          onChatsFound(
            querySnapshot.docs.reduce((chats, snapshot) => {
              const chatFirebase = snapshot.data()
              chats[chatFirebase.jeuneId] = chatFromFirebase(
                snapshot.id,
                chatFirebase
              )
              return chats
            }, {} as { [idJeune: string]: Chat })
          )
        }
      )
    } catch (e) {
      console.error(e)
      captureRUMError(e as Error)
      throw e
    }
  }

  async getChatsDuConseiller(
    idConseiller: string
  ): Promise<{ [idJeune: string]: Chat }> {
    try {
      const docSnapshots = await this.getChatsSnapshot(idConseiller)
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
          const messages: Message[] =
            querySnapshot.docs.map(docSnapshotToMessage)

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

  private async getChatsSnapshot(
    idConseiller: string
  ): Promise<QueryDocumentSnapshot<FirebaseChat>[]> {
    const collectionRef = collection(
      this.getDb(),
      this.collectionName
    ) as CollectionReference<FirebaseChat>

    const querySnapshots: QuerySnapshot<FirebaseChat> = await getDocs(
      query<FirebaseChat>(
        collectionRef,
        where('conseillerId', '==', idConseiller)
      )
    )
    return querySnapshots.docs
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

function createFirebaseMessage(
  data: CreateFirebaseMessage | CreateFirebaseMessageWithOffre
): FirebaseMessage {
  const type: TypeMessage = TypeMessage.MESSAGE
  let { encryptedText, iv } = data.message
  const firebaseMessage: FirebaseMessage = {
    content: encryptedText,
    iv,
    conseillerId: data.idConseiller,
    sentBy: UserType.CONSEILLER.toLowerCase(),
    creationDate: Timestamp.fromMillis(data.date.toMillis()),
    type,
  }

  if (Object.prototype.hasOwnProperty.call(data, 'infoPieceJointe')) {
    firebaseMessage.type = TypeMessage.MESSAGE_PJ
    firebaseMessage.piecesJointes = [
      (data as CreateFirebaseMessage).infoPieceJointe!,
    ]
  }

  if (Object.prototype.hasOwnProperty.call(data, 'offre')) {
    firebaseMessage.type = TypeMessage.MESSAGE_OFFRE
    const { id, titre } = (data as CreateFirebaseMessageWithOffre).offre
    firebaseMessage.offre = { id, titre }
  }

  return firebaseMessage
}

interface FirebaseChat {
  jeuneId: string
  seenByConseiller: boolean | undefined
  flaggedByConseiller: boolean | undefined
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
    firebaseChatToUpdate.lastMessageSentAt = Timestamp.fromMillis(
      chat.lastMessageSentAt.toMillis()
    )
  }
  if (chat.lastMessageSentBy) {
    firebaseChatToUpdate.lastMessageSentBy = chat.lastMessageSentBy
  }
  if (chat.lastConseillerReading) {
    firebaseChatToUpdate.lastConseillerReading = Timestamp.fromMillis(
      chat.lastConseillerReading.toMillis()
    )
  }
  if (chat.lastJeuneReading) {
    firebaseChatToUpdate.lastJeuneReading = Timestamp.fromMillis(
      chat.lastJeuneReading.toMillis()
    )
  }
  if (chat.lastMessageIv) {
    firebaseChatToUpdate.lastMessageIv = chat.lastMessageIv
  }

  if (chat.flaggedByConseiller !== undefined) {
    firebaseChatToUpdate.flaggedByConseiller = chat.flaggedByConseiller
  }

  return firebaseChatToUpdate
}

function chatFromFirebase(chatId: string, firebaseChat: FirebaseChat): Chat {
  return {
    chatId: chatId,
    seenByConseiller: firebaseChat.seenByConseiller ?? true,
    newConseillerMessageCount: firebaseChat.newConseillerMessageCount,
    lastMessageContent: firebaseChat.lastMessageContent,
    lastMessageSentAt:
      firebaseChat.lastMessageSentAt &&
      DateTime.fromMillis(firebaseChat.lastMessageSentAt.toMillis()),
    lastMessageSentBy: firebaseChat.lastMessageSentBy,
    lastConseillerReading:
      firebaseChat.lastConseillerReading &&
      DateTime.fromMillis(firebaseChat.lastConseillerReading.toMillis()),
    lastJeuneReading:
      firebaseChat.lastJeuneReading &&
      DateTime.fromMillis(firebaseChat.lastJeuneReading.toMillis()),
    lastMessageIv: firebaseChat.lastMessageIv,
    flaggedByConseiller: Boolean(firebaseChat.flaggedByConseiller),
  }
}

function docSnapshotToMessage(
  docSnapshot: QueryDocumentSnapshot<FirebaseMessage>
): Message {
  const firebaseMessage = docSnapshot.data()
  const message: Message = {
    ...firebaseMessage,
    creationDate: DateTime.fromMillis(firebaseMessage.creationDate.toMillis()),
    id: docSnapshot.id,
    type: firebaseToMessageType(firebaseMessage.type),
  }

  if (message.type === TypeMessage.MESSAGE_PJ) {
    message.infoPiecesJointes = firebaseMessage.piecesJointes ?? []
  }

  if (message.type === TypeMessage.MESSAGE_OFFRE) {
    message.infoOffre = firebaseMessage.offre
  }

  return message
}

function firebaseToMessageType(
  type: TypeMessageFirebase | undefined
): TypeMessage {
  switch (type) {
    case 'NOUVEAU_CONSEILLER':
    case 'NOUVEAU_CONSEILLER_TEMPORAIRE':
      return TypeMessage.NOUVEAU_CONSEILLER
    case 'MESSAGE_PJ':
      return TypeMessage.MESSAGE_PJ
    case 'MESSAGE_OFFRE':
      return TypeMessage.MESSAGE_OFFRE
    case 'MESSAGE':
      return TypeMessage.MESSAGE
    case undefined:
    default:
      console.warn(`Type message ${type} incorrect, traité comme Message`)
      return TypeMessage.MESSAGE
  }
}

export { FirebaseClient }
