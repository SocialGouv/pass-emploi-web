import { ApiClient } from 'clients/api.client'
import { FirebaseClient } from 'clients/firebase.client'
import { unChat, unJeune, unJeuneChat } from 'fixtures/jeune'
import { desMessages, unMessage } from 'fixtures/message'
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
      await messagesService.setReadByConseiller(jeuneChat)

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
      expect(firebaseClient.findChatDuJeune).toHaveBeenCalledWith(
        idConseiller,
        jeune.id,
        expect.any(Function)
      )
    })

    it('calls provided callback with new jeuneChat built from found chat', async () => {
      // Then
      expect(onJeuneChat).toHaveBeenCalledWith({
        ...jeune,
        chatId: 'idChat',
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
      expect(onMessages).toHaveBeenCalledWith([
        {
          date: new Date(2021, 11, 22),
          messages: [
            unMessage({
              content: 'Decrypted: Message du 22/12/2021',
              creationDate: new Date(2021, 11, 22),
            }),
          ],
        },
        {
          date: new Date(2022, 0, 10),
          messages: [
            unMessage({
              content: 'Decrypted: Message du 10/1/2022',
              creationDate: new Date(2022, 0, 10),
            }),
          ],
        },
        {
          date: new Date(2022, 0, 13, 9),
          messages: [
            unMessage({
              content: 'Decrypted: Message du 13/1/2022 9h',
              creationDate: new Date(2022, 0, 13, 9),
            }),
            unMessage({
              content: 'Decrypted: Message du 13/1/2022 10h',
              creationDate: new Date(2022, 0, 13, 10),
            }),
          ],
        },
      ])
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
})
