import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithCustomToken,
  signOut as _signOut,
} from 'firebase/auth'
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
  limit,
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
import {
  InfoOffre,
  Message,
  MessageListeDiffusion,
  TypeMessage,
} from 'interfaces/message'
import { BaseOffre, TypeOffre } from 'interfaces/offre'
import { EncryptedTextWithInitializationVector } from 'utils/chat/chatCrypto'
import { captureError } from 'utils/monitoring/elastic'

type TypeMessageFirebase =
  | 'NOUVEAU_CONSEILLER'
  | 'MESSAGE'
  | 'MESSAGE_PJ'
  | 'MESSAGE_OFFRE'
  | 'MESSAGE_EVENEMENT'
  | 'MESSAGE_EVENEMENT_EMPLOI'
  | 'MESSAGE_SESSION_MILO'
  | 'NOUVEAU_CONSEILLER_TEMPORAIRE'

export type FirebaseMessage = {
  creationDate: Timestamp
  sentBy: string
  content: string
  iv: string | undefined
  piecesJointes?: InfoFichier[]
  conseillerId: string | undefined
  type: TypeMessageFirebase | undefined
  status?: string
  offre?: InfoOffreFirebase
  evenement?: EvenementPartage
  evenementEmploi?: EvenementEmploi
  sessionMilo?: SessionMilo
}

export type FirebaseMessageHistory = {
  date: Timestamp
  previousContent: string
}

export type FirebaseMessageGroupe = {
  creationDate: Timestamp
  sentBy: string
  content: string
  iv: string
  conseillerId: string
  type: TypeMessageFirebase
  idsBeneficiaires: string[]
  piecesJointes?: InfoFichier[]
}

export type InfoOffreFirebase = {
  id: string
  titre: string
  type?: string
}

export interface EvenementPartage {
  id: string
  titre: string
  type: string
  date: string
}

export interface EvenementEmploi {
  id: string
  titre: string
  type: string
  url: string
}

export interface SessionMilo {
  id: string
  titre: string
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
  offre: BaseOffre
}

type UpdateFirebaseMessage = {
  message: string
  date: DateTime
  oldMessage: string
  status: 'edited' | 'deleted'
}

const chatCollection =
  process.env.NEXT_PUBLIC_FIREBASE_CHAT_COLLECTION_NAME || ''
const groupeCollection =
  process.env.NEXT_PUBLIC_FIREBASE_GROUPE_COLLECTION_NAME || ''

export async function signIn(token: string): Promise<void> {
  const initializedApp = retrieveApp()
  const auth = getAuth(initializedApp)

  if (!auth.currentUser) {
    await signInWithCustomToken(auth, token)
  }
}

export async function signOut(): Promise<void> {
  await _signOut(getAuth(retrieveApp()))
}

export async function addMessage(
  idChat: string,
  data: CreateFirebaseMessage
): Promise<void> {
  const firebaseMessage = createFirebaseMessage(data)
  try {
    await addDoc<FirebaseMessage, FirebaseMessage>(
      collection(getChatReference(idChat), 'messages') as CollectionReference<
        FirebaseMessage,
        FirebaseMessage
      >,
      firebaseMessage
    )
  } catch (e) {
    console.error(e)
    captureError(e as Error)
    throw e
  }
}

export async function updateMessage(
  idChat: string,
  idMessage: string,
  data: UpdateFirebaseMessage
) {
  const firebaseMessage = {
    content: data.message,
    status: data.status,
  }
  const historyEntry = {
    date: Timestamp.fromDate(data.date.toJSDate()),
    previousContent: data.oldMessage,
  }

  try {
    const messageReference = getMessageReference(idChat, idMessage)
    await updateDoc<FirebaseMessage, FirebaseMessage>(
      messageReference,
      firebaseMessage
    )
    await addDoc<FirebaseMessageHistory, FirebaseMessageHistory>(
      collection(messageReference, 'history') as CollectionReference<
        FirebaseMessageHistory,
        FirebaseMessageHistory
      >,
      historyEntry
    )
  } catch (e) {
    console.error(e)
    captureError(e as Error)
    throw e
  }
}

export async function updateChat(
  idChat: string,
  toUpdate: Partial<Chat>
): Promise<void> {
  try {
    await updateDoc<FirebaseChat, FirebaseChat>(
      getChatReference(idChat),
      chatToFirebase(toUpdate)
    )
  } catch (e) {
    console.error(e)
    captureError(e as Error)
    throw e
  }
}

export function findAndObserveChatsDuConseiller(
  idConseiller: string,
  onChatsFound: (chats: { [idJeune: string]: Chat }) => void
): () => void {
  try {
    return onSnapshot<FirebaseChat, FirebaseChat>(
      query<FirebaseChat, FirebaseChat>(
        collection(getDb(), chatCollection) as CollectionReference<
          FirebaseChat,
          FirebaseChat
        >,
        where('conseillerId', '==', idConseiller)
      ),
      (querySnapshot: QuerySnapshot<FirebaseChat, FirebaseChat>) => {
        if (querySnapshot.empty) onChatsFound({})
        else
          onChatsFound(
            querySnapshot.docs.reduce(
              (chats, snapshot) => {
                const chatFirebase = snapshot.data()
                chats[chatFirebase.jeuneId] = chatFromFirebase(
                  snapshot.id,
                  chatFirebase
                )
                return chats
              },
              {} as { [idJeune: string]: Chat }
            )
          )
      }
    )
  } catch (e) {
    console.error(e)
    captureError(e as Error)
    throw e
  }
}

export async function getChatsDuConseiller(
  idConseiller: string
): Promise<{ [idJeune: string]: Chat }> {
  try {
    const docSnapshots = await getChatsSnapshot(idConseiller)
    return docSnapshots.reduce(
      (mappedChats, document) => {
        const firebaseChat: FirebaseChat = document.data()
        mappedChats[firebaseChat.jeuneId] = chatFromFirebase(
          document.id,
          firebaseChat
        )
        return mappedChats
      },
      {} as { [idJeune: string]: Chat }
    )
  } catch (e) {
    console.error(e)
    captureError(e as Error)
    throw e
  }
}

export async function getMessagesGroupe(
  idConseiller: string,
  idGroupe: string
): Promise<MessageListeDiffusion[]> {
  try {
    const groupeSnapshot = await getGroupeSnapshot(idConseiller, idGroupe)
    if (!groupeSnapshot) {
      console.error(
        'Aucun document correspondant à la liste de diffusion ' + idGroupe
      )
      return []
    }

    const querySnapshots: QuerySnapshot<
      FirebaseMessageGroupe,
      FirebaseMessageGroupe
    > = await getDocs(
      query<FirebaseMessageGroupe, FirebaseMessageGroupe>(
        collection(groupeSnapshot.ref, 'messages') as CollectionReference<
          FirebaseMessageGroupe,
          FirebaseMessageGroupe
        >,
        orderBy('creationDate')
      )
    )
    return querySnapshots.docs.map(docSnapshotToMessageListeDiffusion)
  } catch (e) {
    console.error(e)
    captureError(e as Error)
    throw e
  }
}

export function observeChat(
  idChat: string,
  onChat: (chat: Chat) => void
): () => void {
  try {
    return onSnapshot(
      getChatReference(idChat),
      (docSnapshot: DocumentSnapshot<FirebaseChat>) => {
        const data = docSnapshot.data()
        if (!data) return
        onChat(chatFromFirebase(docSnapshot.id, data))
      }
    )
  } catch (e) {
    console.error(e)
    captureError(e as Error)
    throw e
  }
}

export function observeDerniersMessagesDuChat(
  idChat: string,
  nbMessages: number,
  onMessagesAntechronologiques: (messages: Message[]) => void
): () => void {
  try {
    return onSnapshot<FirebaseMessage, FirebaseMessage>(
      query<FirebaseMessage, FirebaseMessage>(
        collection(getChatReference(idChat), 'messages') as CollectionReference<
          FirebaseMessage,
          FirebaseMessage
        >,
        orderBy('creationDate', 'desc'),
        limit(nbMessages)
      ),
      (querySnapshot: QuerySnapshot<FirebaseMessage, FirebaseMessage>) => {
        const messages: Message[] = querySnapshot.docs.map(docSnapshotToMessage)
        if (messages.length && !messages[messages.length - 1].creationDate) {
          return
        }

        onMessagesAntechronologiques(messages)
      }
    )
  } catch (e) {
    console.error(e)
    captureError(e as Error)
    throw e
  }
}

function retrieveApp() {
  const appAlreadyInitialized: number = getApps().length
  if (!appAlreadyInitialized) {
    return initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    })
  } else {
    return getApp()
  }
}

async function getGroupeSnapshot(
  idConseiller: string,
  idGroupe: string
): Promise<QueryDocumentSnapshot<FirebaseGroupe, FirebaseGroupe> | undefined> {
  const collectionRef = collection(
    getDb(),
    groupeCollection
  ) as CollectionReference<FirebaseGroupe, FirebaseGroupe>

  const querySnapshots: QuerySnapshot<FirebaseGroupe, FirebaseGroupe> =
    await getDocs(
      query<FirebaseGroupe, FirebaseGroupe>(
        collectionRef,
        where('conseillerId', '==', idConseiller),
        where('groupeId', '==', idGroupe)
      )
    )

  if (querySnapshots.docs.length > 0) return querySnapshots.docs[0]
}

async function getChatsSnapshot(
  idConseiller: string
): Promise<QueryDocumentSnapshot<FirebaseChat, FirebaseChat>[]> {
  const collectionRef = collection(
    getDb(),
    chatCollection
  ) as CollectionReference<FirebaseChat, FirebaseChat>

  const querySnapshots: QuerySnapshot<FirebaseChat, FirebaseChat> =
    await getDocs(
      query<FirebaseChat, FirebaseChat>(
        collectionRef,
        where('conseillerId', '==', idConseiller)
      )
    )
  return querySnapshots.docs
}

function getDb(): Firestore {
  return getFirestore(getApp())
}

function getChatReference(
  idChat: string
): DocumentReference<FirebaseChat, FirebaseChat> {
  return doc<FirebaseChat, FirebaseChat>(
    collection(getDb(), chatCollection) as CollectionReference<
      FirebaseChat,
      FirebaseChat
    >,
    idChat
  )
}

function getMessageReference(
  idChat: string,
  idMessage: string
): DocumentReference<FirebaseMessage, FirebaseMessage> {
  return doc<FirebaseMessage, FirebaseMessage>(
    collection(getChatReference(idChat), 'messages') as CollectionReference<
      FirebaseMessage,
      FirebaseMessage
    >,
    idMessage
  )
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
    const {
      id,
      titre,
      type: typeOffre,
    } = (data as CreateFirebaseMessageWithOffre).offre
    firebaseMessage.offre = { id, titre, type: typeToFirebase(typeOffre) }
  }

  return firebaseMessage
}

type FirebaseChat = {
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

type FirebaseGroupe = {
  groupeId: string
  conseillerId: string
  lastMessageContent: string | undefined
  lastMessageIv: string | undefined
  lastMessageSentAt: Timestamp | undefined
}

function typeToFirebase(typeOffre: TypeOffre): string {
  switch (typeOffre) {
    case TypeOffre.EMPLOI:
      return 'EMPLOI'
    case TypeOffre.SERVICE_CIVIQUE:
      return 'SERVICE_CIVIQUE'
    case TypeOffre.IMMERSION:
      return 'IMMERSION'
    case TypeOffre.ALTERNANCE:
      return 'ALTERNANCE'
  }
}

function offreFromFirebase(offre: InfoOffreFirebase): InfoOffre {
  let type: TypeOffre
  switch (offre.type) {
    case 'SERVICE_CIVIQUE':
      type = TypeOffre.SERVICE_CIVIQUE
      break
    case 'IMMERSION':
      type = TypeOffre.IMMERSION
      break
    case 'ALTERNANCE':
      type = TypeOffre.ALTERNANCE
      break
    case 'EMPLOI':
    default:
      type = TypeOffre.EMPLOI
  }

  return { ...offre, type }
}

export function chatToFirebase(chat: Partial<Chat>): Partial<FirebaseChat> {
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

export function docSnapshotToMessage(
  docSnapshot: QueryDocumentSnapshot<FirebaseMessage>
): Message {
  const firebaseMessage = docSnapshot.data()
  const message: Message = {
    sentBy: firebaseMessage.sentBy,
    content: firebaseMessage.content,
    iv: firebaseMessage.iv,
    conseillerId: firebaseMessage.conseillerId,
    creationDate: DateTime.fromMillis(firebaseMessage.creationDate.toMillis()),
    id: docSnapshot.id,
    type: firebaseToMessageType(firebaseMessage.type),
    status: firebaseMessage.status,
  }

  if (message.type === TypeMessage.MESSAGE_PJ) {
    message.infoPiecesJointes = firebaseMessage.piecesJointes ?? []
  }

  if (message.type === TypeMessage.MESSAGE_OFFRE && firebaseMessage.offre) {
    message.infoOffre = offreFromFirebase(firebaseMessage.offre)
  }

  if (
    message.type === TypeMessage.MESSAGE_EVENEMENT &&
    firebaseMessage.evenement
  ) {
    message.infoEvenement = {
      id: firebaseMessage.evenement.id,
      titre: firebaseMessage.evenement.titre,
      date: DateTime.fromISO(firebaseMessage.evenement.date),
    }
  }

  if (
    message.type === TypeMessage.MESSAGE_EVENEMENT_EMPLOI &&
    firebaseMessage.evenementEmploi
  ) {
    message.infoEvenementEmploi = {
      id: firebaseMessage.evenementEmploi.id,
      titre: firebaseMessage.evenementEmploi.titre,
      url: firebaseMessage.evenementEmploi.url,
    }
  }

  if (
    message.type === TypeMessage.MESSAGE_SESSION_MILO &&
    firebaseMessage.sessionMilo
  ) {
    message.infoSessionImilo = {
      id: firebaseMessage.sessionMilo.id,
      titre: firebaseMessage.sessionMilo.titre,
    }
  }

  return message
}

export function docSnapshotToMessageListeDiffusion(
  docSnapshot: QueryDocumentSnapshot<FirebaseMessageGroupe>
): MessageListeDiffusion {
  const firebaseMessage = docSnapshot.data()
  const message: MessageListeDiffusion = {
    content: firebaseMessage.content,
    iv: firebaseMessage.iv,
    creationDate: DateTime.fromMillis(firebaseMessage.creationDate.toMillis()),
    id: docSnapshot.id,
    type: firebaseToMessageType(firebaseMessage.type),
    idsDestinataires: firebaseMessage.idsBeneficiaires,
  }

  if (message.type === TypeMessage.MESSAGE_PJ) {
    message.infoPiecesJointes = firebaseMessage.piecesJointes ?? []
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
    case 'MESSAGE_EVENEMENT':
      return TypeMessage.MESSAGE_EVENEMENT
    case 'MESSAGE_EVENEMENT_EMPLOI':
      return TypeMessage.MESSAGE_EVENEMENT_EMPLOI
    case 'MESSAGE_SESSION_MILO':
      return TypeMessage.MESSAGE_SESSION_MILO
    case 'MESSAGE':
      return TypeMessage.MESSAGE
    case undefined:
    default:
      console.warn(`Type message ${type} incorrect, traité comme Message`)
      return TypeMessage.MESSAGE
  }
}
