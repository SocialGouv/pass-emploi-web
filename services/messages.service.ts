import { FichierResponse } from '../interfaces/json/fichier'

import { ApiClient } from 'clients/api.client'
import { FirebaseClient } from 'clients/firebase.client'
import { UserStructure, UserType } from 'interfaces/conseiller'
import { Chat, Jeune, JeuneChat } from 'interfaces/jeune'
import {
  ChatCredentials,
  Message,
  MessagesOfADay,
  TypeMessage,
} from 'interfaces/message'
import { ChatCrypto } from 'utils/chat/chatCrypto'
import { formatDayDate } from 'utils/date'

export interface MessagesService {
  getChatCredentials(accessToken: string): Promise<ChatCredentials>

  signIn(token: string): Promise<void>

  signOut(): Promise<void>

  sendNouveauMessage(
    conseiller: { id: string; structure: string },
    jeuneChat: JeuneChat,
    newMessage: string,
    accessToken: string,
    cleChiffrement: string
  ): void

  sendFichier(
    conseiller: { id: string; structure: string },
    jeuneChat: JeuneChat,
    piecesJointes: FichierResponse,
    accessToken: string,
    cleChiffrement: string
  ): void

  sendNouveauMessageGroupe(
    conseiller: { id: string; structure: string },
    idsDestinataires: string[],
    newMessage: string,
    accessToken: string,
    cleChiffrement: string
  ): Promise<void>

  setReadByConseiller(idChat: string): void

  observeJeuneChat(
    idConseiller: string,
    jeune: Jeune,
    cleChiffrement: string,
    updateChat: (chat: JeuneChat) => void
  ): () => void

  observeMessages(
    idChat: string,
    cleChiffrement: string,
    onMessagesGroupesParJour: (messagesGroupesParJour: MessagesOfADay[]) => void
  ): () => void

  observeJeuneReadingDate(
    idChat: string,
    onJeuneReadingDate: (date: Date) => void
  ): () => void

  countMessagesNotRead(
    idConseiller: string,
    idsJeunes: string[]
  ): Promise<{ [idJeune: string]: number }>
}

export class MessagesFirebaseAndApiService implements MessagesService {
  constructor(
    private readonly firebaseClient: FirebaseClient,
    private readonly chatCrypto: ChatCrypto,
    private readonly apiClient: ApiClient
  ) {}

  async getChatCredentials(accessToken: string): Promise<ChatCredentials> {
    const { token, cle: cleChiffrement } = await this.apiClient.post<{
      token: string
      cle: string
    }>('/auth/firebase/token', {}, accessToken)
    return { token: token, cleChiffrement }
  }

  async signIn(token: string): Promise<void> {
    await this.firebaseClient.signIn(token)
  }

  async signOut(): Promise<void> {
    await this.firebaseClient.signOut()
  }

  async setReadByConseiller(idChat: string): Promise<void> {
    const now = new Date()
    await this.firebaseClient.updateChat(idChat, {
      seenByConseiller: true,
      lastConseillerReading: now,
    })
  }

  observeJeuneChat(
    idConseiller: string,
    jeune: Jeune,
    cleChiffrement: string,
    onJeuneChat: (chat: JeuneChat) => void
  ): () => void {
    return this.firebaseClient.findAndObserveChatDuJeune(
      idConseiller,
      jeune.id,
      (chat: Chat) => {
        const newJeuneChat: JeuneChat = {
          ...jeune,
          ...chat,
          lastMessageContent: chat.lastMessageIv
            ? this.chatCrypto.decrypt(
                {
                  encryptedText: chat.lastMessageContent ?? '',
                  iv: chat.lastMessageIv,
                },
                cleChiffrement
              )
            : chat.lastMessageContent,
        }

        onJeuneChat(newJeuneChat)
      }
    )
  }

  observeMessages(
    idChat: string,
    cleChiffrement: string,
    onMessagesGroupesParJour: (messagesGroupesParJour: MessagesOfADay[]) => void
  ): () => void {
    return this.firebaseClient.observeMessagesDuChat(
      idChat,
      (messages: Message[]) => {
        const messagesGroupesParJour: MessagesOfADay[] =
          this.grouperMessagesParJour(messages, cleChiffrement)
        onMessagesGroupesParJour(messagesGroupesParJour)
      }
    )
  }

  observeJeuneReadingDate(
    idChat: string,
    onJeuneReadingDate: (date: Date) => void
  ): () => void {
    return this.firebaseClient.observeChat(idChat, (chat: Chat) => {
      const lastJeuneReadingDate = chat.lastJeuneReading
      if (lastJeuneReadingDate) {
        onJeuneReadingDate(lastJeuneReadingDate)
      }
    })
  }

  async countMessagesNotRead(
    idConseiller: string,
    idsJeunes: string[]
  ): Promise<{ [idJeune: string]: number }> {
    const chats = await this.firebaseClient.getChatsDesJeunes(
      idConseiller,
      idsJeunes
    )
    return idsJeunes.reduce((mappedCounts, idJeune) => {
      mappedCounts[idJeune] = chats[idJeune]?.newConseillerMessageCount ?? 0
      return mappedCounts
    }, {} as { [idJeune: string]: number })
  }

  async sendFichier(
    conseiller: { id: string; structure: UserStructure },
    jeuneChat: JeuneChat,
    piecesJointes: FichierResponse,
    accessToken: string,
    cleChiffrement: string
  ) {
    const now = new Date()
    const encryptedMessage = this.chatCrypto.encrypt(
      'Création d’une nouvelle pièce jointe',
      cleChiffrement
    )
    await Promise.all([
      this.firebaseClient.addFichier(
        jeuneChat.chatId,
        conseiller.id,
        encryptedMessage,
        piecesJointes,
        now
      ),
      this.firebaseClient.updateChat(jeuneChat.chatId, {
        lastMessageContent: encryptedMessage.encryptedText,
        lastMessageIv: encryptedMessage.iv,
        lastMessageSentAt: now,
        lastMessageSentBy: UserType.CONSEILLER.toLowerCase(),
        newConseillerMessageCount: jeuneChat.newConseillerMessageCount + 1,
        seenByConseiller: true,
        lastConseillerReading: now,
      }),
    ])
    await Promise.all([
      this.notifierNouveauMessage(conseiller.id, [jeuneChat.id], accessToken),
      this.evenementNouveauMessage(
        conseiller.structure,
        conseiller.id,
        accessToken
      ),
    ])
  }

  async sendNouveauMessage(
    conseiller: { id: string; structure: UserStructure },
    jeuneChat: JeuneChat,
    newMessage: string,
    accessToken: string,
    cleChiffrement: string
  ) {
    const now = new Date()
    const encryptedMessage = this.chatCrypto.encrypt(newMessage, cleChiffrement)
    await Promise.all([
      this.firebaseClient.addMessage(
        jeuneChat.chatId,
        conseiller.id,
        encryptedMessage,
        now
      ),
      this.firebaseClient.updateChat(jeuneChat.chatId, {
        lastMessageContent: encryptedMessage.encryptedText,
        lastMessageIv: encryptedMessage.iv,
        lastMessageSentAt: now,
        lastMessageSentBy: UserType.CONSEILLER.toLowerCase(),
        newConseillerMessageCount: jeuneChat.newConseillerMessageCount + 1,
        seenByConseiller: true,
        lastConseillerReading: now,
      }),
    ])
    await Promise.all([
      this.notifierNouveauMessage(conseiller.id, [jeuneChat.id], accessToken),
      this.evenementNouveauMessage(
        conseiller.structure,
        conseiller.id,
        accessToken
      ),
    ])
  }

  async sendNouveauMessageGroupe(
    conseiller: { id: string; structure: UserStructure },
    idsDestinataires: string[],
    newMessage: string,
    accessToken: string,
    cleChiffrement: string
  ) {
    const now = new Date()
    const encryptedMessage = this.chatCrypto.encrypt(newMessage, cleChiffrement)

    const mappedChats = await this.firebaseClient.getChatsDesJeunes(
      conseiller.id,
      idsDestinataires
    )

    await Promise.all([
      Object.values(mappedChats).map((chat) => {
        return Promise.all([
          this.firebaseClient.addMessage(
            chat.chatId,
            conseiller.id,
            encryptedMessage,
            now
          ),
          this.firebaseClient.updateChat(chat.chatId, {
            lastMessageContent: encryptedMessage.encryptedText,
            lastMessageIv: encryptedMessage.iv,
            lastMessageSentAt: now,
            lastMessageSentBy: UserType.CONSEILLER.toLowerCase(),
            newConseillerMessageCount: chat.newConseillerMessageCount + 1,
            seenByConseiller: false,
            lastConseillerReading: new Date(0),
          }),
        ])
      }),
    ])

    await Promise.all([
      this.notifierNouveauMessage(conseiller.id, idsDestinataires, accessToken),
      this.evenementNouveauMessageMultiple(
        conseiller.structure,
        conseiller.id,
        accessToken
      ),
    ])
  }

  private async notifierNouveauMessage(
    idConseiller: string,
    idsJeunes: string[],
    accessToken: string
  ): Promise<void> {
    await this.apiClient.post(
      `/conseillers/${idConseiller}/jeunes/notify-messages`,
      { idsJeunes: idsJeunes },
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
          type: UserType.CONSEILLER,
          structure: structure,
          id: idConseiller,
        },
      },
      accessToken
    )
  }

  private async evenementNouveauMessageMultiple(
    structure: string,
    idConseiller: string,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.post(
      '/evenements',
      {
        type: 'MESSAGE_ENVOYE_MULTIPLE',
        emetteur: {
          type: UserType.CONSEILLER,
          structure: structure,
          id: idConseiller,
        },
      },
      accessToken
    )
  }

  private grouperMessagesParJour(
    messages: Message[],
    cleChiffrement: string
  ): MessagesOfADay[] {
    const messagesByDay: { [day: string]: MessagesOfADay } = {}

    messages
      .filter((message) => message.type !== TypeMessage.NOUVEAU_CONSEILLER)
      .forEach((message) => {
        message.content = message.iv
          ? this.chatCrypto.decrypt(
              {
                encryptedText: message.content,
                iv: message.iv,
              },
              cleChiffrement
            )
          : message.content
        const day = formatDayDate(message.creationDate)
        const messagesOfDay = messagesByDay[day] ?? {
          date: message.creationDate,
          messages: [],
        }
        messagesOfDay.messages.push(message)
        messagesByDay[day] = messagesOfDay
      })

    return Object.values(messagesByDay)
  }
}
