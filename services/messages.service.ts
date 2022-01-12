import { ApiClient } from 'clients/api.client'
import { Message, MessagesOfADay } from 'interfaces'
import { Chat, Jeune, JeuneChat } from 'interfaces/jeune'
import { ChatCrypto } from 'utils/chat/chatCrypto'
import { formatDayDate } from 'utils/date'
import { FirebaseClient } from 'utils/firebaseClient'

export interface MessagesService {
  signIn(token: string): Promise<void>

  signOut(): Promise<void>

  sendNouveauMessage(
    conseiller: { id: string; structure: string },
    jeuneChat: JeuneChat,
    newMessage: string,
    accessToken: string
  ): void

  setReadByConseiller(jeuneChat: JeuneChat): void

  observeChat(
    idConseiller: string,
    jeune: Jeune,
    updateChat: (chat: JeuneChat) => void
  ): () => void

  observeMessages(
    jeuneChat: JeuneChat,
    onMessagesGroupesParJour: (messagesGroupesParJour: MessagesOfADay[]) => void
  ): () => void

  observeJeuneReadingDate(
    jeuneChat: JeuneChat,
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
    await this.firebaseClient.signIn(token)
  }

  async sendNouveauMessage(
    conseiller: { id: string; structure: string },
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

  async setReadByConseiller(jeuneChat: JeuneChat): Promise<void> {
    const now = new Date()
    await this.firebaseClient.updateChat(jeuneChat.chatId, {
      seenByConseiller: true,
      lastConseillerReading: now,
    })
  }

  observeChat(
    idConseiller: string,
    jeune: Jeune,
    updateChat: (chat: JeuneChat) => void
  ): () => void {
    return this.firebaseClient.findChatDuJeune(
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

        updateChat(newJeuneChat)
      }
    )
  }

  observeMessages(
    jeuneChat: JeuneChat,
    onMessagesGroupesParJour: (messagesGroupesParJour: MessagesOfADay[]) => void
  ): () => void {
    return this.firebaseClient.observeMessagesDuChat(
      jeuneChat.chatId,
      (messages: Message[]) => {
        const messagesGroupesParJour: MessagesOfADay[] =
          this.grouperMessagesParJour(messages)
        onMessagesGroupesParJour(messagesGroupesParJour)
      }
    )
  }

  observeJeuneReadingDate(
    jeuneChat: JeuneChat,
    onJeuneReadingDate: (date: Date) => void
  ): () => void {
    return this.firebaseClient.observeChat(jeuneChat.chatId, (chat: Chat) => {
      const lastJeuneReadingDate = chat.lastJeuneReading
      if (lastJeuneReadingDate) {
        onJeuneReadingDate(lastJeuneReadingDate)
      }
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

  private grouperMessagesParJour(messages: Message[]) {
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
