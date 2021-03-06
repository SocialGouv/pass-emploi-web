import { ApiClient } from 'clients/api.client'
import { FirebaseClient } from 'clients/firebase.client'
import {
  desItemsJeunes,
  unChat,
  uneBaseJeune,
  unJeuneChat,
} from 'fixtures/jeune'
import { desMessages, desMessagesParJour } from 'fixtures/message'
import { UserStructure } from 'interfaces/conseiller'
import { Chat, JeuneChat, JeuneFromListe } from 'interfaces/jeune'
import { Message, MessagesOfADay } from 'interfaces/message'
import { MessagesFirebaseAndApiService } from 'services/messages.service'
import { FakeApiClient } from 'tests/utils/fakeApiClient'
import { ChatCrypto } from 'utils/chat/chatCrypto'

jest.mock('clients/firebase.client')
jest.mock('utils/chat/chatCrypto')

describe('MessagesFirebaseAndApiService', () => {
  beforeEach(async () => {
    jest.useFakeTimers()
  })

  let firebaseClient: FirebaseClient
  let apiClient: ApiClient
  let messagesService: MessagesFirebaseAndApiService
  let accessToken: string
  let cleChiffrement: string

  beforeEach(async () => {
    // Given
    firebaseClient = new FirebaseClient()
    apiClient = new FakeApiClient()
    messagesService = new MessagesFirebaseAndApiService(
      firebaseClient,
      new ChatCrypto(),
      apiClient
    )
    accessToken = 'accessToken'
    cleChiffrement = 'cleChiffrement'
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

  describe('.toggleFlag', () => {
    it('updates chat in firebase', async () => {
      // Given
      const jeuneChat = unJeuneChat()

      // When
      await messagesService.toggleFlag(jeuneChat.chatId, false)

      // Then
      expect(firebaseClient.updateChat).toHaveBeenCalledWith(jeuneChat.chatId, {
        flaggedByConseiller: false,
      })
    })
  })

  describe('.observeConseillerChats', () => {
    let idConseiller: string
    let updateChats: (chats: Chat[]) => void
    beforeEach(async () => {
      // Given
      jest.setSystemTime(new Date())
      idConseiller = 'idConseiller'
      updateChats = jest.fn()

      // When
      messagesService.observeConseillerChats(
        idConseiller,
        cleChiffrement,
        [
          { ...uneBaseJeune({ id: 'jeune-1' }), isActivated: true },
          { ...uneBaseJeune({ id: 'jeune-2' }), isActivated: false },
          { ...uneBaseJeune({ id: 'jeune-3' }), isActivated: true },
        ],
        updateChats
      )
    })

    it('finds chat in firebase', async () => {
      // Then
      expect(
        firebaseClient.findAndObserveChatsDuConseiller
      ).toHaveBeenCalledWith(idConseiller, expect.any(Function))
    })

    it('calls provided callback with new jeuneChat built from found chat', async () => {
      // Then
      expect(updateChats).toHaveBeenCalledWith([
        { ...uneBaseJeune({ id: 'jeune-1' }), isActivated: true, ...unChat() },
        { ...uneBaseJeune({ id: 'jeune-2' }), isActivated: false, ...unChat() },
        { ...uneBaseJeune({ id: 'jeune-3' }), isActivated: true, ...unChat() },
      ])
    })
  })

  describe('.observeMessages', () => {
    let idChat: string
    let onMessages: (messagesGroupesParJour: MessagesOfADay[]) => void
    beforeEach(async () => {
      // Given
      ;(firebaseClient.observeMessagesDuChat as jest.Mock).mockImplementation(
        (idChat: string, fn: (messages: Message[]) => void) => fn(desMessages())
      )
      idChat = 'idChat'
      onMessages = jest.fn()

      // When
      await messagesService.observeMessages(idChat, cleChiffrement, onMessages)
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
    it('retourne nombre de messages nons lus par les jeunes', async () => {
      // Given
      const idConseiller = 'conseiller-1'
      const idsJeunes: string[] = ['jeune-1', 'jeune-2', 'jeune-3']

      //When
      const actual = await messagesService.countMessagesNotRead(
        idConseiller,
        idsJeunes
      )

      //Then
      expect(firebaseClient.getChatsDuConseiller).toHaveBeenCalledWith(
        idConseiller
      )
      expect(actual).toEqual({
        ['jeune-1']: 1,
        ['jeune-2']: 1,
        ['jeune-3']: 1,
      })
    })

    it("quand un jeune n'a pas de chat, retourne 0", async () => {
      //Given
      ;(firebaseClient.getChatsDuConseiller as jest.Mock).mockResolvedValue({})

      //When
      const actual = await messagesService.countMessagesNotRead(
        'conseiller-1',
        ['jeune-1', 'jeune-2', 'jeune-3']
      )

      //Then
      expect(actual).toEqual({
        'jeune-1': 0,
        'jeune-2': 0,
        'jeune-3': 0,
      })
    })
  })

  describe('.sendNouveauMessage', () => {
    let conseiller: { id: string; structure: UserStructure }
    let jeuneChat: JeuneChat
    let newMessage: string
    const now = new Date()
    beforeEach(async () => {
      // Given
      jest.setSystemTime(now)
      jeuneChat = unJeuneChat()
      newMessage = 'nouveauMessage'
      // When
      conseiller = { id: 'idConseiller', structure: UserStructure.POLE_EMPLOI }
    })

    describe('sans piece jointe', () => {
      beforeEach(async () => {
        await messagesService.sendNouveauMessage({
          conseiller,
          jeuneChat,
          newMessage,
          accessToken,
          cleChiffrement,
        })
      })
      it('adds a new message to firebase', async () => {
        // Then
        expect(firebaseClient.addMessage).toHaveBeenCalledWith({
          idChat: jeuneChat.chatId,
          idConseiller: conseiller.id,
          message: {
            encryptedText: `Encrypted: ${newMessage}`,
            iv: `IV: ${newMessage}`,
          },
          date: now,
        })
      })

      it('updates chat in firebase', async () => {
        // Then
        expect(firebaseClient.updateChat).toHaveBeenCalledWith(
          jeuneChat.chatId,
          {
            lastMessageContent: `Encrypted: ${newMessage}`,
            lastMessageIv: `IV: ${newMessage}`,
            lastMessageSentAt: now,
            lastMessageSentBy: 'conseiller',
            newConseillerMessageCount: jeuneChat.newConseillerMessageCount + 1,
            seenByConseiller: true,
            lastConseillerReading: now,
          }
        )
      })

      it('notifies of a new message', async () => {
        // Then
        expect(apiClient.post).toHaveBeenCalledWith(
          `/conseillers/${conseiller.id}/jeunes/notify-messages`,
          { idsJeunes: [jeuneChat.id] },
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

    describe('avec piece jointe', () => {
      beforeEach(async () => {
        await messagesService.sendNouveauMessage({
          conseiller,
          jeuneChat,
          newMessage,
          infoPieceJointe: { id: 'fake-id', nom: 'fake-nom' },
          accessToken,
          cleChiffrement,
        })
      })

      it('adds a new message to firebase', async () => {
        // Then
        expect(firebaseClient.addMessage).toHaveBeenCalledWith({
          idChat: jeuneChat.chatId,
          idConseiller: conseiller.id,
          message: {
            encryptedText: `Encrypted: ${newMessage}`,
            iv: `IV: ${newMessage}`,
          },
          infoPieceJointe: { id: 'fake-id', nom: 'Encrypted: fake-nom' },
          date: now,
        })
      })

      it('tracks new message', async () => {
        // Then
        expect(apiClient.post).toHaveBeenCalledWith(
          '/evenements',
          {
            type: 'MESSAGE_ENVOYE_PJ',
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
  })

  describe('.sendNouveauMessageGroupe', () => {
    let destinataires: JeuneFromListe[]
    let idsJeunes: string[]
    let chats: { [idJeune: string]: Chat }
    let newMessageGroupe: string
    const now = new Date()
    beforeEach(async () => {
      // Given
      jest.setSystemTime(now)
      destinataires = desItemsJeunes()
      idsJeunes = destinataires.map(({ id }) => id)
      newMessageGroupe = 'nouveau message group??'

      // When
      chats = idsJeunes.reduce((mappedChats, idJeune) => {
        mappedChats[idJeune] = unChat({ chatId: `chat-${idJeune}` })
        return mappedChats
      }, {} as { [idJeune: string]: Chat })
      ;(firebaseClient.getChatsDuConseiller as jest.Mock).mockResolvedValue(
        chats
      )
    })

    describe('sans piece jointe', () => {
      beforeEach(async () => {
        await messagesService.sendNouveauMessageGroupe({
          conseiller: {
            id: 'id-conseiller',
            structure: UserStructure.MILO,
          },
          idsDestinataires: idsJeunes,
          newMessage: newMessageGroupe,
          accessToken,
          cleChiffrement,
        })
      })

      it('ajoute un nouveau message ?? firebase pour chaque destinataire', () => {
        // Then
        expect(firebaseClient.getChatsDuConseiller).toHaveBeenCalledWith(
          'id-conseiller'
        )

        Object.values(chats).forEach((chat) => {
          expect(firebaseClient.addMessage).toHaveBeenCalledWith({
            idChat: chat.chatId,
            idConseiller: 'id-conseiller',
            message: {
              encryptedText: `Encrypted: ${newMessageGroupe}`,
              iv: `IV: ${newMessageGroupe}`,
            },
            date: now,
          })
        })
      })

      it('met ?? jour le chat dans firebase pour chaque destinataire', () => {
        expect(firebaseClient.getChatsDuConseiller).toHaveBeenCalledWith(
          'id-conseiller'
        )
        // Then
        Object.values(chats).forEach((chat) => {
          expect(firebaseClient.updateChat).toHaveBeenCalledWith(chat.chatId, {
            lastMessageContent: `Encrypted: ${newMessageGroupe}`,
            lastMessageIv: `IV: ${newMessageGroupe}`,
            lastMessageSentAt: now,
            lastMessageSentBy: 'conseiller',
            newConseillerMessageCount: chat.newConseillerMessageCount + 1,
            seenByConseiller: false,
            lastConseillerReading: new Date(0),
          })
        })
      })

      it('notifie envoi de message pour chaque destinataire', () => {
        // Then
        expect(apiClient.post).toHaveBeenCalledWith(
          `/conseillers/id-conseiller/jeunes/notify-messages`,
          { idsJeunes: idsJeunes },
          accessToken
        )
      })

      it('tracks nouveau message group??', () => {
        // Then
        expect(apiClient.post).toHaveBeenCalledWith(
          '/evenements',
          {
            type: 'MESSAGE_ENVOYE_MULTIPLE',
            emetteur: {
              type: 'CONSEILLER',
              structure: UserStructure.MILO,
              id: 'id-conseiller',
            },
          },
          accessToken
        )
      })
    })

    describe('avec piece jointe', () => {
      beforeEach(async () => {
        await messagesService.sendNouveauMessageGroupe({
          conseiller: {
            id: 'id-conseiller',
            structure: UserStructure.MILO,
          },
          idsDestinataires: idsJeunes,
          newMessage: newMessageGroupe,
          accessToken,
          cleChiffrement,
          infoPieceJointe: { id: 'fake-id', nom: 'fake-nom' },
        })
      })

      it('ajoute un nouveau message ?? firebase pour chaque destinataire', () => {
        // Then
        expect(firebaseClient.getChatsDuConseiller).toHaveBeenCalledWith(
          'id-conseiller'
        )

        Object.values(chats).forEach((chat) => {
          expect(firebaseClient.addMessage).toHaveBeenCalledWith({
            idChat: chat.chatId,
            idConseiller: 'id-conseiller',
            message: {
              encryptedText: `Encrypted: ${newMessageGroupe}`,
              iv: `IV: ${newMessageGroupe}`,
            },
            date: now,
            infoPieceJointe: { id: 'fake-id', nom: 'Encrypted: fake-nom' },
          })
        })
      })

      it('tracks nouveau message group?? avec piece jointe', () => {
        // Then
        expect(apiClient.post).toHaveBeenCalledWith(
          '/evenements',
          {
            type: 'MESSAGE_ENVOYE_MULTIPLE_PJ',
            emetteur: {
              type: 'CONSEILLER',
              structure: UserStructure.MILO,
              id: 'id-conseiller',
            },
          },
          accessToken
        )
      })
    })
  })
})
