import { ApiClient } from 'clients/api.client'
import { Message, MessagesOfADay } from 'interfaces'
import { Chat, Jeune, JeuneChat } from 'interfaces/jeune'
import { ChatCrypto } from 'utils/chat/chatCrypto'
import { formatDayDate } from 'utils/date'
import { FirebaseClient } from 'clients/firebase.client'
import { UserStructure } from '../interfaces/conseiller'

export interface MessagesService {
  signIn(token: string): Promise<void>

  signOut(): Promise<void>

  sendNouveauMessage(
    conseiller: { id: string; structure: string },
    jeuneChat: JeuneChat,
    newMessage: string,
    accessToken: string
  ): void

  sendNouveauMessageMultiple(
    conseiller: { id: string; structure: string },
    destinataires: Jeune[],
    newMessage: string,
    accessToken: string
  ): Promise<void>

  setReadByConseiller(idChat: string): void

  observeJeuneChat(
    idConseiller: string,
    jeune: Jeune,
    updateChat: (chat: JeuneChat) => void
  ): () => void

  observeMessages(
    idChat: string,
    onMessagesGroupesParJour: (messagesGroupesParJour: MessagesOfADay[]) => void
  ): () => void

  observeJeuneReadingDate(
    idChat: string,
    onJeuneReadingDate: (date: Date) => void
  ): () => void

  countMessagesNotRead(idConseiller: string, idJeune: string): Promise<number>
}

export class MessagesFirebaseAndApiService implements MessagesService {
  constructor(
    private readonly firebaseClient: FirebaseClient,
    private readonly chatCrypto: ChatCrypto,
    private readonly apiClient: ApiClient
  ) {}

  async signIn(token: string): Promise<void> {
    await this.firebaseClient.signIn(token)
  }

  async signOut(): Promise<void> {
    await this.firebaseClient.signOut()
  }

  async sendNouveauMessage(
    conseiller: { id: string; structure: UserStructure },
    jeuneChat: JeuneChat,
    newMessage: string,
    accessToken: string
  ) {
    const now = new Date()
    const encryptedMessage = this.chatCrypto.encrypt(newMessage)

    await Promise.all([
      this.firebaseClient.addMessage(jeuneChat.chatId, encryptedMessage, now),
      this.firebaseClient.updateChat(jeuneChat.chatId, {
        lastMessageContent: encryptedMessage.encryptedText,
        lastMessageIv: encryptedMessage.iv,
        lastMessageSentAt: now,
        lastMessageSentBy: 'conseiller',
        newConseillerMessageCount: jeuneChat.newConseillerMessageCount + 1,
        seenByConseiller: true,
        lastConseillerReading: now,
      }),
    ])

    await Promise.all([
      this.notifierNouveauMessage(conseiller.id, jeuneChat.id, accessToken),
      this.evenementNouveauMessage(
        conseiller.structure,
        conseiller.id,
        accessToken
      ),
    ])
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
    onJeuneChat: (chat: JeuneChat) => void
  ): () => void {
    return this.firebaseClient.findAndObserveChatDuJeune(
      idConseiller,
      jeune.id,
      (id: string, chat: Chat) => {
        const newJeuneChat: JeuneChat = {
          ...jeune,
          chatId: id,
          seenByConseiller: chat.seenByConseiller ?? true,
          newConseillerMessageCount: chat.newConseillerMessageCount,
          lastMessageContent: chat.lastMessageIv
            ? this.chatCrypto.decrypt({
                encryptedText: chat.lastMessageContent ?? '',
                iv: chat.lastMessageIv,
              })
            : chat.lastMessageContent,
          lastMessageSentAt: chat.lastMessageSentAt,
          lastMessageSentBy: chat.lastMessageSentBy,
          lastConseillerReading: chat.lastConseillerReading,
          lastJeuneReading: chat.lastJeuneReading,
          lastMessageIv: chat.lastMessageIv,
        }

        onJeuneChat(newJeuneChat)
      }
    )
  }

  observeMessages(
    idChat: string,
    onMessagesGroupesParJour: (messagesGroupesParJour: MessagesOfADay[]) => void
  ): () => void {
    return this.firebaseClient.observeMessagesDuChat(
      idChat,
      (messages: Message[]) => {
        const messagesGroupesParJour: MessagesOfADay[] =
          this.grouperMessagesParJour(messages)
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
    idJeune: string
  ): Promise<number> {
    const chat = await this.firebaseClient.getChatDuJeune(idConseiller, idJeune)
    return chat?.newConseillerMessageCount ?? 0
  }

  async sendNouveauMessageMultiple(
    conseiller: { id: string; structure: UserStructure },
    destinataires: Jeune[],
    newMessage: string,
    accessToken: string
  ) {
    const now = new Date()
    const encryptedMessage = this.chatCrypto.encrypt(newMessage)

    const idsJeunes = destinataires.map((destinataire) => destinataire.id)

    const chats = await this.firebaseClient.getChatsDesJeunes(
      conseiller.id,
      idsJeunes
    )

    await Promise.all([
      chats.map((chat) => {
        return Promise.all([
          this.firebaseClient.addMessage(chat.chatId, encryptedMessage, now),
          this.firebaseClient.updateChat(chat.chatId, {
            lastMessageContent: encryptedMessage.encryptedText,
            lastMessageIv: encryptedMessage.iv,
            lastMessageSentAt: now,
            lastMessageSentBy: 'conseiller',
            newConseillerMessageCount: chat.newConseillerMessageCount + 1,
            seenByConseiller: true,
            lastConseillerReading: now,
          }),
        ])
      }),
    ])

    await Promise.all([
      this.notifierNouveauMessageMultiple(
        conseiller.id,
        idsJeunes,
        accessToken
      ),
      this.evenementNouveauMessage(
        conseiller.structure,
        conseiller.id,
        accessToken
      ),
    ])
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

  private async notifierNouveauMessageMultiple(
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
          type: 'CONSEILLER',
          structure: structure,
          id: idConseiller,
        },
      },
      accessToken
    )
  }

  private grouperMessagesParJour(messages: Message[]): MessagesOfADay[] {
    const messagesByDay: { [day: string]: MessagesOfADay } = {}

    messages.forEach((message: Message) => {
      message.content = message.iv
        ? this.chatCrypto.decrypt({
            encryptedText: message.content,
            iv: message.iv,
          })
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
