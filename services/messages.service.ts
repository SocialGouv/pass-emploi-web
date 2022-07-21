import { ApiClient } from 'clients/api.client'
import { AddMessage, FirebaseClient } from 'clients/firebase.client'
import { UserType } from 'interfaces/conseiller'
import { InfoFichier } from 'interfaces/fichier'
import { BaseJeune, Chat, JeuneChat } from 'interfaces/jeune'
import {
  ChatCredentials,
  Message,
  MessagesOfADay,
  TypeMessage,
} from 'interfaces/message'
import { ChatCrypto } from 'utils/chat/chatCrypto'
import { formatDayDate } from 'utils/date'

interface FormNouveauMessage {
  conseiller: { id: string; structure: string }
  newMessage: string
  accessToken: string
  cleChiffrement: string
  infoPieceJointe?: InfoFichier
}

export type FormNouveauMessageIndividuel = FormNouveauMessage & {
  jeuneChat: JeuneChat
}
export type FormNouveauMessageGroupe = FormNouveauMessage & {
  idsDestinataires: string[]
}

export interface MessagesService {
  getChatCredentials(accessToken: string): Promise<ChatCredentials>

  signIn(token: string): Promise<void>

  signOut(): Promise<void>

  sendNouveauMessage(params: FormNouveauMessageIndividuel): void

  sendNouveauMessageGroupe(params: FormNouveauMessageGroupe): Promise<void>

  setReadByConseiller(idChat: string): void

  toggleFlag(idChat: string, flagged: boolean): void

  observeConseillerChats(
    idConseiller: string,
    cleChiffrement: string,
    jeunes: Array<BaseJeune & { isActivated: boolean }>,
    updateChats: (chats: JeuneChat[]) => void
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
    const {
      content: { token, cle: cleChiffrement },
    } = await this.apiClient.post<{
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

  async toggleFlag(idChat: string, flagged: boolean): Promise<void> {
    await this.firebaseClient.updateChat(idChat, {
      flaggedByConseiller: flagged,
    })
  }

  observeConseillerChats(
    idConseiller: string,
    cleChiffrement: string,
    jeunes: Array<BaseJeune & { isActivated: boolean }>,
    updateChats: (chats: JeuneChat[]) => void
  ): () => void {
    return this.firebaseClient.findAndObserveChatsDuConseiller(
      idConseiller,
      (chats: { [idJeune: string]: Chat }) => {
        const newChats = jeunes
          .filter((jeune) => Boolean(chats[jeune.id]))
          .map((jeune) => {
            const chat = chats[jeune.id]
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
            return newJeuneChat
          })

        updateChats(newChats)
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
    const chats = await this.firebaseClient.getChatsDuConseiller(idConseiller)
    return idsJeunes.reduce((mappedCounts, idJeune) => {
      mappedCounts[idJeune] = chats[idJeune]?.newConseillerMessageCount ?? 0
      return mappedCounts
    }, {} as { [idJeune: string]: number })
  }

  async sendNouveauMessage({
    accessToken,
    cleChiffrement,
    conseiller,
    infoPieceJointe,
    jeuneChat,
    newMessage,
  }: FormNouveauMessageIndividuel) {
    const now = new Date()
    const encryptedMessage = this.chatCrypto.encrypt(newMessage, cleChiffrement)

    const nouveauMessage: AddMessage = {
      idChat: jeuneChat.chatId,
      idConseiller: conseiller.id,
      message: encryptedMessage,
      date: now,
    }

    if (infoPieceJointe) {
      nouveauMessage.infoPieceJointe = {
        ...infoPieceJointe,
        nom: this.chatCrypto.encryptWithCustomIv(
          infoPieceJointe.nom,
          cleChiffrement,
          encryptedMessage.iv
        ),
      }
    }

    await Promise.all([
      this.firebaseClient.addMessage(nouveauMessage),
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

    const avecPieceJointe = Boolean(infoPieceJointe)
    await Promise.all([
      this.notifierNouveauMessage(conseiller.id, [jeuneChat.id], accessToken),
      this.evenementNouveauMessage(
        conseiller.structure,
        conseiller.id,
        avecPieceJointe,
        accessToken
      ),
    ])
  }

  async sendNouveauMessageGroupe({
    accessToken,
    cleChiffrement,
    conseiller,
    idsDestinataires,
    infoPieceJointe,
    newMessage,
  }: FormNouveauMessageGroupe) {
    const now = new Date()
    const encryptedMessage = this.chatCrypto.encrypt(newMessage, cleChiffrement)

    const mappedChats = await this.firebaseClient.getChatsDuConseiller(
      conseiller.id
    )
    const chatsDestinataires = Object.entries(mappedChats)
      .filter(([idJeune]) => idsDestinataires.includes(idJeune))
      .map(([_, chat]) => chat)

    let infoPieceJointeChiffrees: InfoFichier
    if (infoPieceJointe) {
      infoPieceJointeChiffrees = {
        ...infoPieceJointe,
        nom: this.chatCrypto.encryptWithCustomIv(
          infoPieceJointe.nom,
          cleChiffrement,
          encryptedMessage.iv
        ),
      }
    }

    await Promise.all([
      chatsDestinataires.map((chat) => {
        const nouveauMessage: AddMessage = {
          idChat: chat.chatId,
          idConseiller: conseiller.id,
          message: encryptedMessage,
          date: now,
        }
        if (infoPieceJointeChiffrees) {
          nouveauMessage.infoPieceJointe = infoPieceJointeChiffrees
        }

        return Promise.all([
          this.firebaseClient.addMessage(nouveauMessage),
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

    const avecPieceJointe = Boolean(infoPieceJointe)
    await Promise.all([
      this.notifierNouveauMessage(conseiller.id, idsDestinataires, accessToken),
      this.evenementNouveauMessageMultiple(
        conseiller.structure,
        conseiller.id,
        avecPieceJointe,
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
    avecPieceJointe: boolean,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.post(
      '/evenements',
      {
        type: avecPieceJointe ? 'MESSAGE_ENVOYE_PJ' : 'MESSAGE_ENVOYE',
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
    avecPieceJointe: boolean,
    accessToken: string
  ): Promise<void> {
    await this.apiClient.post(
      '/evenements',
      {
        type: avecPieceJointe
          ? 'MESSAGE_ENVOYE_MULTIPLE_PJ'
          : 'MESSAGE_ENVOYE_MULTIPLE',
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
        if (message.iv) {
          message = this.decryptMessageAndFilename(message, cleChiffrement)
        }

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

  private decryptMessageAndFilename(
    message: Message,
    cleChiffrement: string
  ): Message {
    const iv = message.iv!
    const decryptedMessage: Message = {
      ...message,
      content: this.chatCrypto.decrypt(
        { encryptedText: message.content, iv },
        cleChiffrement
      ),
    }

    if (message.infoPiecesJointes?.length) {
      decryptedMessage.infoPiecesJointes = message.infoPiecesJointes.map(
        ({ id, nom }) => ({
          id,
          nom: this.chatCrypto.decrypt(
            { encryptedText: nom, iv },
            cleChiffrement
          ),
        })
      )
    }

    return decryptedMessage
  }
}
