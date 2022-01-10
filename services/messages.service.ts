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

const collectionName = process.env.FIREBASE_COLLECTION_NAME || ''

export class MessagesService {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly db: Firestore,
    private readonly chatCrypto: ChatCrypto
  ) {}

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

  setReadByConseiller(jeune: Jeune) {
    updateDoc<JeuneChat>(this.getChatReference(jeune), {
      seenByConseiller: true,
      lastConseillerReading: serverTimestamp(),
    })
  }

  private getChatReference(jeune: Jeune): DocumentReference<JeuneChat> {
    return doc<JeuneChat>(
      collection(this.db, collectionName) as CollectionReference<JeuneChat>,
      jeune.chatId
    )
  }
}
