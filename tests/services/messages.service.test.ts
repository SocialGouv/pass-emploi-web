import { ApiClient } from 'clients/api.client'
import { FirebaseClient } from 'clients/firebase.client'
import { unChat, unJeune, unJeuneChat } from 'fixtures/jeune'
import { desMessages, desMessagesParJour } from 'fixtures/message'
import { Message, MessagesOfADay } from 'interfaces'
import { UserStructure } from 'interfaces/conseiller'
import { Chat, Jeune, JeuneChat } from 'interfaces/jeune'
import { MessagesFirebaseAndApiService } from 'services/messages.service'
import { ChatCrypto } from 'utils/chat/chatCrypto'

jest.mock('clients/api.client')
jest.mock('clients/firebase.client')
jest.mock('utils/chat/chatCrypto')

beforeEach(async () => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('MessagesFirebaseAndApiService', () => {
  let firebaseClient: FirebaseClient
  let apiClient: ApiClient
  let messagesService: MessagesFirebaseAndApiService
  beforeEach(async () => {
    // Given
    firebaseClient = new FirebaseClient()
    apiClient = new ApiClient()
    messagesService = new MessagesFirebaseAndApiService(
      firebaseClient,
      new ChatCrypto(),
      apiClient
    )
  })

  describe('.signIn', () => {
    it('calls firebase signin', async () => {
      // Given
      const firebaseToken = 'firebaseToken'

      // When
      await messagesService.signIn(firebaseToken)

      // Then
      expect(firebaseClient.signIn).toHaveBeenCalledWith(firebaseToken)
    })
  })

  describe('.signOut', () => {
    it('calls firebase signout', async () => {
      // When
      await messagesService.signOut()

      // Then
      expect(firebaseClient.signOut).toHaveBeenCalled()
    })
  })

  describe('.sendNouveauMessage', () => {
    let conseiller: { id: string; structure: UserStructure }
    let jeuneChat: JeuneChat
    let newMessage: string
    let accessToken: string
    const now = new Date()
    beforeEach(async () => {
      // Given
      jest.setSystemTime(now)
      jeuneChat = unJeuneChat()
      newMessage = 'nouveauMessage'

      // When
      accessToken = 'accessToken'
      conseiller = { id: 'idConseiller', structure: UserStructure.POLE_EMPLOI }
      await messagesService.sendNouveauMessage(
        conseiller,
        jeuneChat,
        newMessage,
        accessToken
      )
    })

    it('adds a new message to firebase', async () => {
      // Then
      expect(firebaseClient.addMessage).toHaveBeenCalledWith(
        jeuneChat.chatId,
        {
          encryptedText: `Encrypted: ${newMessage}`,
          iv: `IV: ${newMessage}`,
        },
        now
      )
    })

    it('updates chat in firebase', async () => {
      // Then
      expect(firebaseClient.updateChat).toHaveBeenCalledWith(jeuneChat.chatId, {
        lastMessageContent: `Encrypted: ${newMessage}`,
        lastMessageIv: `IV: ${newMessage}`,
        lastMessageSentAt: now,
        lastMessageSentBy: 'conseiller',
        newConseillerMessageCount: jeuneChat.newConseillerMessageCount + 1,
        seenByConseiller: true,
        lastConseillerReading: now,
      })
    })

    it('notifies of a new message', async () => {
      // Then
      expect(apiClient.post).toHaveBeenCalledWith(
        `/conseillers/${conseiller.id}/jeunes/${jeuneChat.id}/notify-message`,
        undefined,
        accessToken
      )
    })

    it('tracks new message', async () => {
      // Then
      expect(apiClient.post).toHaveBeenCalledWith(
        '/evenements',
        {
          type: 'MESSAGE_ENVOYE',
          emetteur: {
            type: 'CONSEILLER',
            structure: conseiller.structure,
            id: conseiller.id,
          },
        },
        accessToken
      )
    })
  })

  describe('.setReadByConseiller', () => {
    it('updates chat in firebase', async () => {
      // Given
      const now = new Date()
      jest.setSystemTime(now)
      const jeuneChat = unJeuneChat()

      // When
      await messagesService.setReadByConseiller(jeuneChat.chatId)

      // Then
      expect(firebaseClient.updateChat).toHaveBeenCalledWith(jeuneChat.chatId, {
        seenByConseiller: true,
        lastConseillerReading: now,
      })
    })
  })

  describe('.observeJeuneChat', () => {
    let idConseiller: string
    let jeune: Jeune
    let onJeuneChat: (chat: Chat) => void
    beforeEach(async () => {
      // Given
      jest.setSystemTime(new Date())
      idConseiller = 'idConseiller'
      jeune = unJeune()
      onJeuneChat = jest.fn()

      // When
      await messagesService.observeJeuneChat(idConseiller, jeune, onJeuneChat)
    })

    it('finds chat in firebase', async () => {
      // Then
      expect(firebaseClient.findAndObserveChatDuJeune).toHaveBeenCalledWith(
        idConseiller,
        jeune.id,
        expect.any(Function)
      )
    })

    it('calls provided callback with new jeuneChat built from found chat', async () => {
      // Then
      expect(onJeuneChat).toHaveBeenCalledWith({
        ...jeune,
        chatId: 'chat-id',
        ...unChat(),
      })
    })
  })

  describe('.observeMessages', () => {
    let idChat: string
    let onMessages: (messagesGroupesParJou: MessagesOfADay[]) => void
    beforeEach(async () => {
      // Given
      ;(firebaseClient.observeMessagesDuChat as jest.Mock).mockImplementation(
        (idChat: string, fn: (messages: Message[]) => void) => fn(desMessages())
      )
      idChat = 'idChat'
      onMessages = jest.fn()

      // When
      await messagesService.observeMessages(idChat, onMessages)
    })

    it('subscribes to chat messages in firebase', async () => {
      // Then
      expect(firebaseClient.observeMessagesDuChat).toHaveBeenCalledWith(
        idChat,
        expect.any(Function)
      )
    })

    it('calls provided callback with decrypted messages grouped by day', async () => {
      // Then
      expect(onMessages).toHaveBeenCalledWith(desMessagesParJour())
    })
  })

  describe('.observeJeuneReadingDate', () => {
    let idChat: string
    let jeuneReadingDate: Date
    let onJeuneReadingDate: (date: Date) => void
    beforeEach(async () => {
      // Given
      jeuneReadingDate = new Date(2022, 0, 12)
      ;(firebaseClient.observeChat as jest.Mock).mockImplementation(
        (idChat: string, fn: (chat: Chat) => void) =>
          fn(unChat({ lastJeuneReading: jeuneReadingDate }))
      )
      idChat = 'idChat'
      onJeuneReadingDate = jest.fn()

      // When
      await messagesService.observeJeuneReadingDate(idChat, onJeuneReadingDate)
    })

    it('subscribes to chat in firebase', async () => {
      // Then
      expect(firebaseClient.observeChat).toHaveBeenCalledWith(
        idChat,
        expect.any(Function)
      )
    })

    it('calls provided callback with chat lastJeuneReadingDate', async () => {
      // Then
      expect(onJeuneReadingDate).toHaveBeenCalledWith(jeuneReadingDate)
    })
  })
  describe('.messagesNotRead', () => {
    it('retourne nombre de messages nons lus par un jeune', async () => {
      // Given
      const idConseiller = 'conseiller-1'
      const jeuneId = 'jeune-2'

      //When
      const actual = await messagesService.countMessagesNotRead(
        idConseiller,
        jeuneId
      )

      //Then
      expect(firebaseClient.getChatDuJeune).toHaveBeenCalledWith(
        idConseiller,
        jeuneId
      )
      expect(actual).toEqual(1)
    })

    it("quand un jeune n'a pas de chat, retourne 0", async () => {
      //Given
      ;(firebaseClient.getChatDuJeune as jest.Mock).mockResolvedValue(undefined)

      //When
      const actual = await messagesService.countMessagesNotRead(
        'conseiller-1',
        'jeune-1'
      )

      //Then
      expect(actual).toEqual(0)
    })
  })

  describe('.sendNouveauMessageMultiple', () => {
    let conseiller: { id: string; structure: UserStructure }
    let destinataires: Jeune[]
    let newMessageGroupe: string
    let accessToken: string
    const now = new Date()

    beforeEach(async () => {
      // Given
      jest.setSystemTime(now)
      destinataires = [unJeune()]
      newMessageGroupe = 'nouveau message groupé'

      // When
      accessToken = 'accessToken'
      conseiller = { id: 'idConseiller', structure: UserStructure.POLE_EMPLOI }
      await messagesService.sendNouveauMessageMultiple(
        conseiller,
        destinataires,
        newMessageGroupe,
        accessToken
      )
    })

    it('adds a new message to firebase', async () => {
      // Then
      destinataires.forEach((destinataire) => {
        expect(firebaseClient.addMessage).toHaveBeenCalledWith(
          destinataire.id,
          {
            encryptedText: `Encrypted: ${newMessageGroupe}`,
            iv: `IV: ${newMessageGroupe}`,
          },
          now
        )
      })
    })
  })
})
