import { ApiClient } from 'clients/api.client'
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  Firestore,
  increment,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { Jeune, JeuneChat } from 'interfaces/jeune'
import { ChatCrypto } from 'utils/chat/chatCrypto'
import { FirebaseClient } from 'utils/firebaseClient'

const collectionName = process.env.FIREBASE_COLLECTION_NAME || ''
export interface MessagesService {
  signIn(token: string): Promise<void>

  signOut(): Promise<void>

  getDb(): Firestore

  sendNouveauMessage(
    conseiller: { id: string; structure: string },
    jeune: Jeune,
    newMessage: string,
    accessToken: string
  ): void

  setReadByConseiller(jeune: Jeune): void
}

export class MessagesFirebaseAndApiService implements MessagesService {
  private firebaseClient!: FirebaseClient
  constructor(
    private readonly apiClient: ApiClient,
    private readonly chatCrypto: ChatCrypto
  ) {
    this.firebaseClient = new FirebaseClient()
  }

  async signOut(): Promise<void> {
    this.firebaseClient.signOut()
  }

  async signIn(token: string): Promise<void> {
    if (!this.firebaseClient.firebaseIsSignedIn()) {
      this.firebaseClient.signIn(token)
    }
  }

  getDb(): Firestore {
    return this.firebaseClient.getDb()
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

    addDoc(collection(chatRef, 'messages'), {
      content: encryptedText,
      creationDate: firestoreNow,
      sentBy: 'conseiller',
      iv,
    })

    updateDoc(chatRef, {
      seenByConseiller: true,
      newConseillerMessageCount: increment(1),
      lastMessageContent: encryptedText,
      lastMessageSentAt: firestoreNow,
      lastMessageSentBy: 'conseiller',
      lastMessageIv: iv,
    })

    this.setReadByConseiller(jeune)

    this.notifierNouveauMessage(conseiller.id, jeune.id, accessToken)

    this.evenementNouveauMessage(
      conseiller.structure,
      conseiller.id,
      accessToken
    )
  }

  setReadByConseiller(jeune: Jeune) {
    updateDoc<JeuneChat>(this.getChatReference(jeune), {
      seenByConseiller: true,
      lastConseillerReading: serverTimestamp(),
    })
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
